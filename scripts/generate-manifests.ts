import { ContractManifest, FacetManifest } from '@flair-sdk/registry';
import { ethers, utils } from 'ethers';
import * as fse from 'fs-extra';
import glob from 'glob';
import hre from 'hardhat';
import * as path from 'path';
import { dirname } from 'path';

import * as pkgJson from '../package.json';
import { getInterfaceID } from '../test/utils/interface';

const FQN_PREFIX = 'flair-sdk:';
const FACETS_SOURCE_TEMPLATE = 'https://github.com/flair-sdk/contracts/blob/v{VERSION}/src/{ARTIFACT_KEY}.sol';
const FACETS_AUTHOR = 'flair-sdk.eth';

const resolvedInterfaces: Record<string, string> = {};

async function main() {
  const registry: Record<string, ContractManifest> = {};
  const srcPath = path.resolve(__dirname, '../src');

  //
  // 1. Gather addresses
  //
  const deploymentsRoot = path.resolve(__dirname, '../deployments');
  const deploymentFiles = glob.sync('*/*.json', {
    nodir: true,
    cwd: deploymentsRoot,
    follow: true,
  });

  for (const file of deploymentFiles) {
    const chainName = path.dirname(file);
    const chainId = (await fse.readFile(path.join(deploymentsRoot, chainName, '.chainId'))).toString();
    const deploymentJson = await fse.readJSON(path.resolve(deploymentsRoot, file));
    const contractAddress = deploymentJson.address;
    const artifactName = path.basename(file).split('.', -1)[0];
    const sourceFile = `${artifactName}.sol`;

    const files = glob.sync(`**/${sourceFile}`, {
      cwd: path.resolve(__dirname, '../src'),
      nodir: true,
      follow: true,
    });

    if (files.length !== 1) {
      throw new Error(`Could not find contract ${artifactName} in src/ directory: ${JSON.stringify(files)}`);
    }

    let contractFqn = `${FQN_PREFIX}${files[0].split('.', -1)[0]}`;

    if (!contractFqn) {
      throw new Error(`Could not get artifact key for ${file}`);
    }

    if (!registry[contractFqn]) {
      registry[contractFqn] = {
        fqn: contractFqn,
        version: pkgJson.version,
      };
    }

    if (!registry[contractFqn].address) {
      registry[contractFqn].address = {};
    }

    (registry[contractFqn].address as any)[chainId] = contractAddress;
    (registry[contractFqn].address as any)[chainName] = contractAddress;
  }

  //
  // 2. Add ABI artifacts
  //
  const artifactsRoot = path.resolve(__dirname, '../artifacts/src');
  const files = glob.sync('**/*.json', {
    nodir: true,
    cwd: artifactsRoot,
    follow: true,
  });

  for (const file of files) {
    if (
      !file.includes('/') ||
      file.startsWith('node_modules') ||
      file.endsWith('.dbg.json') ||
      file === 'package.json'
    ) {
      continue;
    }

    const artifactPath = path.resolve(artifactsRoot, file);
    const { sourceName, contractName } = fse.readJsonSync(artifactPath);
    const sourcePath = path.resolve(path.resolve(__dirname, '../'), sourceName);

    let contractFqn = `${FQN_PREFIX}${
      dirname(sourceName.slice(0, sourceName.lastIndexOf('.'))).replace(/^src\//, '') + '/' + contractName
    }`;

    if (!registry[contractFqn]) {
      registry[contractFqn] = {
        fqn: contractFqn,
        version: pkgJson.version,
      };
    }

    registry[contractFqn].artifact = fse.readJsonSync(artifactPath);
    registry[contractFqn].sourceCode = fse.readFileSync(sourcePath).toString();
  }

  //
  // 3. Write contracts registry
  //
  fse.writeJSONSync(path.resolve(srcPath, 'contracts.json'), registry, {
    spaces: 2,
  });

  //
  // 4. Get build info
  //
  const buildInfoRoot = path.resolve(__dirname, '../artifacts/build-info');
  const buildInfoFiles = glob.sync('*.json', {
    nodir: true,
    cwd: buildInfoRoot,
    follow: true,
  });

  const buildInfo = fse.readJSONSync(path.resolve(buildInfoRoot, buildInfoFiles[0]));

  const facets = await scanForFacets(
    buildInfo,
    registry,
    pkgJson?.version || 'unknown',
    `${FACETS_SOURCE_TEMPLATE.replace('{VERSION}', pkgJson?.version)}`,
    FACETS_AUTHOR,
  );

  //
  // 5. Write facets
  //
  fse.writeJSONSync(path.resolve(srcPath, 'facets.json'), facets, {
    spaces: 2,
  });

  //
  // 6. Write interfaces mapping
  //
  fse.writeJSONSync(path.resolve(srcPath, 'interfaces.json'), resolvedInterfaces, {
    spaces: 2,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    console.log('Finished generating contracts.json registry files.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

async function scanForFacets(
  buildInfo: any,
  registry: Record<string, ContractManifest>,
  version: string,
  source: string,
  author: string,
): Promise<Record<string, FacetManifest>> {
  const facets: Record<string, FacetManifest> = {};

  for (const fqn in registry) {
    const artifact = fqn.split('/').pop();
    const artifactKey = fqn.split(':')[1];
    const file = `src/${artifactKey}.sol`;

    const annotations = {
      ...((artifact && buildInfo?.output?.contracts?.[file]?.[artifact]?.devdoc) || {}),
      ...((artifact && buildInfo?.output?.contracts?.[file]?.[artifact]?.userdoc) || {}),
    };

    const {
      'custom:type': type,
      'custom:category': category = 'Other',
      'custom:peer-dependencies': peerDependencies = '',
      'custom:required-dependencies': requiredDependencies = '',
      'custom:provides-interfaces': providesInterfaces = '',
      title,
      notice,
    } = annotations;

    if (!artifact || type !== 'eip-2535-facet') {
      continue;
    }

    const functionSelectors = Object.keys(
      buildInfo?.output?.contracts?.[file]?.[artifact]?.evm.methodIdentifiers || {},
    );

    if (!registry[fqn].address || !Object.keys(registry[fqn].address || {}).length) {
      throw new Error(`No address found for ${fqn}, have you deployed on any chain yet?`);
    }

    facets[fqn] = {
      addresses: registry[fqn].address as Record<string, string>,
      functionSelectors,

      fqn,
      version,
      providesInterfaces: await resolveInterfaces(stringListToArray(providesInterfaces)),
      peerDependencies: await resolveInterfaces(stringListToArray(peerDependencies)),
      requiredDependencies: await resolveInterfaces(stringListToArray(requiredDependencies)),

      category,
      title,
      notice,
      source: source.replace('{ARTIFACT_KEY}', artifactKey),
      author,
    };
  }

  return facets;
}

export const BYTES32_HEX_REGEXP = /(0x[a-fA-F0-9]{8}|[A-Za-z0-9/\.:]+)/g;

function stringListToArray(input: any): string[] {
  const items = [...input.matchAll(BYTES32_HEX_REGEXP)].map((match) => match[0]).filter((address) => Boolean(address));

  return items.map((s: string) => s.trim());
}

async function resolveInterfaces(input: string[]): Promise<string[]> {
  const interfaces: string[] = [];

  for (const item of input) {
    if (item.startsWith('0x')) {
      interfaces.push(item);
      continue;
    }

    const iface = new utils.Interface(await (await hre.artifacts.readArtifact(item)).abi);

    const eip165InterfaceId = getInterfaceID(iface);

    interfaces.push(eip165InterfaceId.toHexString());

    resolvedInterfaces[item] = eip165InterfaceId.toHexString();
  }

  return interfaces;
}
