import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import '@matterlabs/hardhat-zksync-solc';
import '@matterlabs/hardhat-zksync-deploy';

import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';

const args = process.argv.slice(2);

dotenv.config();
let etherScanApiKey;

if (args.includes('mainnet')) {
  etherScanApiKey = process.env.MAINNET_ETHERSCAN_API_KEY;
} else if (args.includes('ropsten')) {
  etherScanApiKey = process.env.ROPSTEN_ETHERSCAN_API_KEY;
} else if (args.includes('rinkeby')) {
  etherScanApiKey = process.env.RINKEBY_ETHERSCAN_API_KEY;
} else if (args.includes('goerli')) {
  etherScanApiKey = process.env.GOERLI_ETHERSCAN_API_KEY;
} else if (args.includes('sepolia')) {
  etherScanApiKey = process.env.SEPOLIA_ETHERSCAN_API_KEY;
} else if (args.includes('arbitrumOne')) {
  etherScanApiKey = process.env.ARBITRUM_ONE_ETHERSCAN_API_KEY;
} else if (args.includes('arbitrumNova')) {
  etherScanApiKey = process.env.ARBITRUM_NOVA_ETHERSCAN_API_KEY;
} else if (args.includes('arbitrumTestnet')) {
  etherScanApiKey = process.env.ARBITRUM_TESTNET_ETHERSCAN_API_KEY;
} else if (args.includes('opera')) {
  etherScanApiKey = process.env.FANTOM_OPERA_ETHERSCAN_API_KEY;
} else if (args.includes('ftmTestnet')) {
  etherScanApiKey = process.env.FANTOM_TESTNET_ETHERSCAN_API_KEY;
} else if (args.includes('avalanche')) {
  etherScanApiKey = process.env.AVALANCHE_MAINNET_ETHERSCAN_API_KEY;
} else if (args.includes('avalancheFujiTestnet')) {
  etherScanApiKey = process.env.AVALANCHE_FUJI_TESTNET_ETHERSCAN_API_KEY;
} else if (args.includes('polygon')) {
  etherScanApiKey = process.env.POLYGON_ETHERSCAN_API_KEY;
} else if (args.includes('polygonMumbai')) {
  etherScanApiKey = process.env.POLYGON_MUMBAI_ETHERSCAN_API_KEY;
} else if (args.includes('bsc')) {
  etherScanApiKey = process.env.BSC_ETHERSCAN_API_KEY;
} else if (args.includes('bscTestnet')) {
  etherScanApiKey = process.env.BSC_TESTNET_ETHERSCAN_API_KEY;
} else if (args.includes('neonlabs')) {
  etherScanApiKey = process.env.NEON_LABS_ETHERSCAN_API_KEY;
} else if (args.includes('okxMainnet')) {
  etherScanApiKey = '';
} else if (args.includes('zksyncTestnet')) {
  etherScanApiKey = '';
} else if (args.includes('nearAurora')) {
  etherScanApiKey = '';
} else if (args.includes('nearAuroraTestnet')) {
  etherScanApiKey = '';
} else if (args.includes('cronos')) {
  etherScanApiKey = '';
} else if (args.includes('cronosTestnet')) {
  etherScanApiKey = '';
} else if (args.includes('telos')) {
  etherScanApiKey = '';
} else if (args.includes('telosTestnet')) {
  etherScanApiKey = '';
} else if (args.includes('hardhat')) {
  etherScanApiKey = process.env.GOERLI_ETHERSCAN_API_KEY;
} else {
  console.warn(`Could not get network from args! ${args.join(', ')}`);
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  paths: {
    sources: './src',
  },
  solidity: {
    version: '0.8.15',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1337,
      },
    },
  },
  zksolc: {
    version: '1.1.2',
    compilerSource: 'docker',
    settings: {
      optimizer: {
        enabled: true,
      },
      experimental: {
        dockerImage: 'matterlabs/zksolc',
        tag: 'v1.1.2',
      },
    },
  },
  typechain: {
    outDir: './src/typechain',
  },
  zkSyncDeploy: {
    zkSyncNetwork: 'https://zksync2-testnet.zksync.dev',
    ethNetwork: 'goerli',
  },
  gasReporter: {
    coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY || '',
    currency: 'USD',
    enabled: true,
  },
  networks: {
    // Ethereum
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 10_000000000, // 10 gwei
    },
    ropsten: {
      chainId: 3,
      url: process.env.ROPSTEN_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      // gasPrice: 5_000000000, // 5 gwei
    },
    // Fantom
    opera: {
      chainId: 250,
      url: process.env.FANTOM_OPERA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ftmTestnet: {
      chainId: 4002,
      url: process.env.FANTOM_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Avalanche
    avalanche: {
      chainId: 43114,
      url: process.env.AVALANCHE_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    avalancheFujiTestnet: {
      chainId: 43113,
      url: process.env.AVALANCHE_FUJI_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Arbitrum
    arbitrumOne: {
      chainId: 42161,
      url: process.env.ARBITRUM_ONE_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumNova: {
      chainId: 42170,
      url: process.env.ARBITRUM_NOVA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumTestnet: {
      chainId: 421611,
      url: process.env.ARBITRUM_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Polygon
    polygon: {
      chainId: 137,
      url: process.env.POLYGON_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 100_000000000, // 100 gwei
    },
    polygonMumbai: {
      chainId: 80001,
      url: process.env.POLYGON_MUMBAI_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // OKX Chain
    okcTestnet: {
      chainId: 65,
      url: process.env.OKC_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    okcMainnet: {
      chainId: 66,
      url: process.env.OKC_MAINNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Cosmos
    evmosTestnet: {
      chainId: 9000,
      url: process.env.EVMOS_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    evmosMainnet: {
      chainId: 9001,
      url: process.env.EVMOS_MAINNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Binance Chain
    bsc: {
      chainId: 56,
      url: process.env.BSC_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bscTestnet: {
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Near (Aurora)
    nearAurora: {
      chainId: 1313161554,
      url: process.env.NEAR_AURORA_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    nearAuroraTestnet: {
      chainId: 1313161555,
      url: process.env.NEAR_AURORA_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Cronos
    cronos: {
      chainId: 25,
      url: process.env.CRONOS_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    cronosTestnet: {
      chainId: 338,
      url: process.env.CRONOS_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Telos
    telos: {
      chainId: 40,
      url: process.env.TELOS_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    telosTestnet: {
      chainId: 41,
      url: process.env.TELOS_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Celo
    celo: {
      chainId: 42220,
      url: process.env.CELO_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    celoTestnet: {
      chainId: 44787,
      url: process.env.CELO_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // Oasis
    oasisEmerald: {
      chainId: 42262,
      url: process.env.OASIS_EMERALD_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    oasisEmeraldTestnet: {
      chainId: 42261,
      url: process.env.OASIS_EMERALD_TESTNET_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // zkSync
    zksyncTestnet: {
      chainId: 280,
      zksync: true,
      url: 'https://zksync2-testnet.zksync.dev',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },

  etherscan: {
    apiKey: etherScanApiKey,
  },

  contractSizer: {
    alphaSort: false,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};

export default config;
