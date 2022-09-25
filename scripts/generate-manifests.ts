import { FacetManifest } from '@flair-sdk/common';
import * as fse from 'fs-extra';
import glob from 'glob';
import * as path from 'path';
import { dirname } from 'path';

import * as pkgJson from '../package.json';
// import { ContractManifest } from '../src/types';
type ContractManifest = any; // TODO get from registry

const FQN_PREFIX = 'flair-sdk:';
const FACETS_SOURCE_PREFIX = 'npm:@flair-sdk/contracts@';
const FACETS_AUTHOR = 'flair-sdk.eth';

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

  // Add ABI artifacts
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

  fse.writeJSONSync(path.resolve(srcPath, 'contracts.json'), registry);

  // Get build info
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
    `${FACETS_SOURCE_PREFIX}${pkgJson?.version}`,
    FACETS_AUTHOR,
  );

  fse.writeJSONSync(path.resolve(srcPath, 'facets.json'), facets);
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
    const file = `src/${fqn.split(':')[1]}.sol`;

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

    facets[fqn] = {
      addresses: registry[fqn].address as Record<string, string>,
      functionSelectors,

      fqn,
      version,
      providesInterfaces: stringListToArray(providesInterfaces),
      peerDependencies: stringListToArray(peerDependencies),
      requiredDependencies: stringListToArray(requiredDependencies),

      category,
      title,
      notice,
      source,
      author,
    };
  }

  return facets;
}

export const BYTES32_HEX_REGEXP = /0x[a-fA-F0-9]{8}/g;

function stringListToArray(input: any): string[] {
  const items = [...input.matchAll(BYTES32_HEX_REGEXP)].map((match) => match[0]).filter((address) => Boolean(address));

  return items.map((s: string) => s.trim());
}
