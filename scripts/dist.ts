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

type Dependency = string;

type Facet = {
  title: string;
  repo: string;
  ref: string;
  artifact: string;
  version: string;
  peer_dependencies: Dependency[];
  dependencies: Dependency[];
  addresses: Record<string, string>;
  providesInterfaces: string[];
  functionSelectors: string[];
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
  const contractNameToChainToAddress: Record<string, Record<string, string>> = {};
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

    const artifactKey = files[0].split('.', -1)[0];

    if (!artifactKey) {
      throw new Error(`Could not get artifact key for ${file}`);
    }

    if (!contractNameToChainToAddress[artifactKey]) {
      contractNameToChainToAddress[artifactKey] = {};
    }

    contractNameToChainToAddress[artifactKey][chainId] = contractAddress;
    contractNameToChainToAddress[artifactKey][chainName] = contractAddress;
  }

  fse.writeJSONSync(path.resolve(distPath, 'addresses.json'), contractNameToChainToAddress);

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
  fse.copySync(path.resolve(__dirname, '../README.md'), distPath + '/README.md');

  // Add facets to dist

  // TODO Auto-generate facets
  const facets: Facet[] = [
    {
      title: 'ERC1155 - Mintable, Burnable, Lockable',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/ERC1155.sol',
      version: '2.0.0',
      peer_dependencies: [],
      dependencies: [],
      addresses: {
        4: '0x724C344e5a9e01997D542F99ef0D2f7B419819de',
      },
      providesInterfaces: [
        '0xd9b67a26', // IERC1155
        '0x744f4bd4', // IERC1155Supply
        '0xdc290004', // IERC1155Burnable
        '0xff3508c6', // IERC1155Lockable
        '0xb164884b', // IERC1155Mintable
      ],
      functionSelectors: [
        'balanceOf(address,uint256)',
        'balanceOfBatch(address[],uint256[])',
        'burn(address,uint256,uint256)',
        'burnBatch(address,uint256[],uint256[])',
        'burnBatchByFacet(address,uint256[],uint256[])',
        'burnByFacet(address,uint256,uint256)',
        'exists(uint256)',
        'isApprovedForAll(address,address)',
        'lockByFacet(address,uint256,uint256)',
        'locked(address,uint256[])',
        'locked(address,uint256)',
        'maxSupply(uint256)',
        'mintByFacet(address,uint256,uint256,bytes)',
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
        'safeTransferFrom(address,address,uint256,uint256,bytes)',
        'setApprovalForAll(address,bool)',
        'totalSupply(uint256)',
        'unlockByFacet(address,uint256,uint256)',
      ],
    },
    {
      title: 'ERC1155 - Mintable, Burnable, Lockable - with Meta Transactions',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/ERC1155WithERC2771.sol',
      version: '2.0.0',
      peer_dependencies: [],
      dependencies: [],
      addresses: {
        4: '0x25077bcB7F56Be3cB05CD364863Adae0217f3c07',
      },
      providesInterfaces: [
        '0xd9b67a26', // IERC1155
        '0x744f4bd4', // IERC1155Supply
        '0xdc290004', // IERC1155Burnable
        '0xff3508c6', // IERC1155Lockable
        '0xb164884b', // IERC1155Mintable
      ],
      functionSelectors: [
        'balanceOf(address,uint256)',
        'balanceOfBatch(address[],uint256[])',
        'burn(address,uint256,uint256)',
        'burnBatch(address,uint256[],uint256[])',
        'burnBatchByFacet(address,uint256[],uint256[])',
        'burnByFacet(address,uint256,uint256)',
        'exists(uint256)',
        'isApprovedForAll(address,address)',
        'lockByFacet(address,uint256,uint256)',
        'locked(address,uint256[])',
        'locked(address,uint256)',
        'maxSupply(uint256)',
        'mintByFacet(address,uint256,uint256,bytes)',
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
        'safeTransferFrom(address,address,uint256,uint256,bytes)',
        'setApprovalForAll(address,bool)',
        'totalSupply(uint256)',
        'unlockByFacet(address,uint256,uint256)',
      ],
    },
    {
      title: 'ERC1155 - Metadata',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/plugins/metadata/ERC1155Metadata.sol',
      version: '2.0.0',
      peer_dependencies: [
        '0xd9b67a26', // IERC1155
      ],
      dependencies: [],
      addresses: {
        4: '0x877546CE36fC055d2506aCe87838FD22eED420Be',
      },
      providesInterfaces: [
        '0x0e89341c', // IERC1155Metadata
      ],
      functionSelectors: ['uri(uint256)'],
    },
    {
      title: 'ERC1155 - Metadata - Admin - Ownable',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/plugins/metadata/ERC1155MetadataOwnable.sol',
      version: '2.0.0',
      peer_dependencies: [
        '0x0e89341c', // IERC1155Metadata
      ],
      dependencies: [],
      addresses: {
        4: '0x7b151958c3Fc4261fF3AD87c614163dAB22e7B6B',
      },
      providesInterfaces: [
        '0x0dfe03d4', // IERC1155MetadataAdmin
      ],
      functionSelectors: [
        'lockBaseURI()',
        'lockFallbackURI()',
        'lockURIUntil(uint256)',
        'setBaseURI(string)',
        'setFallbackURI(string)',
        'setURI(uint256,string)',
        'setURIBatch(uint256[],string[])',
      ],
    },
    {
      title: 'ERC1155 - Mint by Owner',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/plugins/minting/ERC1155MintByOwner.sol',
      version: '2.0.0',
      peer_dependencies: [],
      dependencies: [
        '0xb164884b', // IERC1155Mintable (mintByFacet)
      ],
      addresses: {
        4: '0x3D8C1631b5666D2E0C9a3D5618d41d4E70DCcb84',
      },
      providesInterfaces: [
        '0x5135bec1', // IERC1155MintByOwner
      ],
      functionSelectors: ['mintByOwner(address,uint256,uint256,bytes)'],
    },
    {
      title: 'ERC1155 - Mint by Owner - with Meta Transactions',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/plugins/minting/ERC1155MintByOwnerERC2771.sol',
      version: '2.0.0',
      peer_dependencies: [],
      dependencies: [
        '0xb164884b', // IERC1155Mintable
      ],
      addresses: {
        4: '0xE38322E8201De19c923A0cC16467529a6858174A',
      },
      providesInterfaces: [
        '0x5135bec1', // IERC1155MintByOwner
      ],
      functionSelectors: ['mintByOwner(address,uint256,uint256,bytes)'],
    },
    {
      title: 'ERC1155 - Tiered Sales',
      repo: 'github.com/flair-sdk/contracts',
      ref: 'main',
      artifact: 'src/token/ERC1155/plugins/sales/ERC1155TieredSales.sol',
      version: '2.0.0',
      peer_dependencies: [],
      dependencies: [
        '0xb164884b', // IERC1155Mintable
      ],
      addresses: {
        4: '0x21c5968a500c87E1116fBf034E131795498d8cBf',
      },
      providesInterfaces: [
        '0x91cb770f', // ITieredSales
      ],
      functionSelectors: [
        'eligibleForTier(uint256,address,uint256,bytes32[])',
        'mintByTier(uint256,uint256,uint256,bytes32[])',
        'onTierAllowlist(uint256,address,uint256,bytes32[])',
        'remainingForTier(uint256)',
        'tierMints(uint256)',
        'walletMintedByTier(uint256,address)',
      ],
    },
  ];

  fse.writeJSONSync(path.resolve(distPath, 'facets.json'), facets);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
