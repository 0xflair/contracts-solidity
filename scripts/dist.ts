import * as fse from 'fs-extra';
import glob from 'glob';
import * as path from 'path';
import * as rimraf from 'rimraf';

const { chainConfig: chainConfig_ } = require('@nomiclabs/hardhat-etherscan/dist/src/ChainConfig.js');

const chainConfig = {
  ...chainConfig_,
  okcTestnet: {
    chainId: 65,
  },
  okcMainnet: {
    chainId: 66,
  },
  evmosTestnet: {
    chainId: 9000,
  },
  evmosMainnet: {
    chainId: 9001,
  },
  zksyncTestnet: {
    chainId: 280,
  },
};

type EIP165InterfaceID = string;

type FacetManifest = {
  category: string;
  title: string;
  notice: string;
  icon?: string;
  repo: string;
  ref: string;
  fqn: string;
  version: string;
  addresses: Record<string, string>;
  providesInterfaces: EIP165InterfaceID[];
  functionSelectors: string[];
  peerDependencies: EIP165InterfaceID[];
  requiredDependencies: EIP165InterfaceID[];
};

async function main() {
  const distPath = path.resolve(__dirname, '../dist');

  fse.mkdirSync(distPath, { recursive: true });

  // Add Solidity source code
  fse.copySync(path.resolve(__dirname, '../src'), distPath);

  // Add type bindings
  fse.copySync(path.resolve(__dirname, '../typechain'), distPath + '/typechain');

  // Add ABI artifacts
  const artifactsRoot = path.resolve(__dirname, '../artifacts/src');
  const files = glob.sync('**/*.json', {
    nodir: true,
    cwd: artifactsRoot,
    follow: true,
  });
  for (const file of files) {
    fse.copySync(
      path.resolve(artifactsRoot, file),
      path.resolve(distPath, path.dirname(path.dirname(file)), path.basename(file)),
    );
  }

  // Add OpenZeppelin ABI artifacts for convenience
  const ozRoot = path.resolve(__dirname, '../node_modules/@openzeppelin/contracts');
  const ozBuildRoot = path.resolve(ozRoot, 'build');
  const ozFiles = glob.sync('**/*.json', {
    nodir: true,
    cwd: ozBuildRoot,
    follow: true,
  });
  for (const file of ozFiles) {
    let { sourceName } = fse.readJsonSync(path.resolve(ozBuildRoot, file));
    sourceName = sourceName.replace(/^contracts\//i, '');

    fse.copySync(
      path.resolve(ozBuildRoot, file),
      path.resolve(distPath + '/openzeppelin', sourceName.replace(/\.sol$/i, '.json')),
    );
    fse.copySync(path.resolve(ozRoot, sourceName), path.resolve(distPath + '/openzeppelin', sourceName));
  }
  fse.removeSync(path.resolve(distPath, 'misc/openzeppelin'));

  // Add Manifold.xyz ABI artifacts for convenience
  const manifoldRoot = path.resolve(__dirname, '../artifacts/@manifoldxyz/contracts');
  const manifoldFiles = glob.sync('**/*.json', {
    nodir: true,
    cwd: manifoldRoot,
    follow: true,
  });
  for (const file of manifoldFiles) {
    fse.copySync(
      path.resolve(manifoldRoot, file),
      path.resolve(distPath + '/manifoldxyz', path.dirname(path.dirname(file)), path.basename(file)),
    );
  }

  // Add deployment addresses
  const contractFqnToChainToAddress: Record<string, Record<string, string>> = {};
  const deploymentsRoot = path.resolve(__dirname, '../deployments');
  const deploymentFiles = glob.sync('*/*.json', {
    nodir: true,
    cwd: deploymentsRoot,
    follow: true,
  });
  for (const file of deploymentFiles) {
    const chainName = path.dirname(file);

    if (!chainConfig[chainName]) {
      throw new Error(`Could not find ID for chain ${chainName} in chainConfig`);
    }

    const chainId = Number(chainConfig[chainName].chainId);
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

    const contractFqn = files[0].split('.', -1)[0];

    if (!contractFqn) {
      throw new Error(`Could not get artifact key for ${file}`);
    }

    if (!contractFqnToChainToAddress[contractFqn]) {
      contractFqnToChainToAddress[contractFqn] = {};
    }

    contractFqnToChainToAddress[contractFqn][chainId] = contractAddress;
    contractFqnToChainToAddress[contractFqn][chainName] = contractAddress;
  }

  fse.writeJSONSync(path.resolve(distPath, 'addresses.json'), contractFqnToChainToAddress);

  // Add build info
  const buildInfoRoot = path.resolve(__dirname, '../artifacts/build-info');
  const buildInfoFiles = glob.sync('*.json', {
    nodir: true,
    cwd: buildInfoRoot,
    follow: true,
  });

  const buildInfo = fse.readJSONSync(path.resolve(buildInfoRoot, buildInfoFiles[0]));

  fse.writeJSONSync(path.resolve(distPath, 'build-info.json'), {
    compilerVersion: `v${buildInfo.solcLongVersion}`,
    solcInput: buildInfo.input,
  });

  // Remove debug files
  rimraf.sync(path.resolve(distPath) + '/**/*.dbg.json');

  // Add package files
  fse.copySync(path.resolve(__dirname, '../package.json'), distPath + '/package.json');
  fse.copySync(path.resolve(__dirname, '../package-lock.json'), distPath + '/package-lock.json');
  fse.copySync(path.resolve(__dirname, '../README.md'), distPath + '/README.md');

  const facets = await scanForFacets(
    buildInfo,
    contractFqnToChainToAddress,
    process.env.REPO || 'unknown',
    process.env.REF || 'unknown',
    process.env.VERSION || 'unknown',
  );
  fse.writeJSONSync(path.resolve(distPath, 'facets.json'), facets);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function scanForFacets(
  buildInfo: any,
  addressesRegistry: Record<string, Record<string, string>>,
  repo: string,
  ref: string,
  version: string,
): Promise<Record<string, FacetManifest>> {
  const facets: Record<string, FacetManifest> = {};

  for (const [fqn, addresses] of Object.entries(addressesRegistry)) {
    const artifact = fqn.split('/').pop();
    const source = `src/${fqn}.sol`;

    const annotations = {
      ...((artifact && buildInfo?.output?.contracts?.[source]?.[artifact]?.devdoc) || {}),
      ...((artifact && buildInfo?.output?.contracts?.[source]?.[artifact]?.userdoc) || {}),
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
      buildInfo?.output?.contracts?.[source]?.[artifact]?.evm.methodIdentifiers || {},
    );

    facets[fqn] = {
      category,
      title,
      notice,
      repo,
      ref,
      fqn,
      version,
      addresses,
      functionSelectors,
      providesInterfaces: stringListToArray(providesInterfaces),
      peerDependencies: stringListToArray(peerDependencies),
      requiredDependencies: stringListToArray(requiredDependencies),
    };
  }

  return facets;
}

export const BYTES32_HEX_REGEXP = /0x[a-fA-F0-9]{8}/g;

function stringListToArray(input: any): string[] {
  const items = [...input.matchAll(BYTES32_HEX_REGEXP)].map((match) => match[0]).filter((address) => Boolean(address));

  return items.map((s: string) => s.trim());
}
