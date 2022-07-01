import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

const args = process.argv.slice(2);

dotenv.config();
let etherScanApiKey;

if (args.includes("mainnet")) {
  etherScanApiKey = process.env.MAINNET_ETHERSCAN_API_KEY;
} else if (args.includes("ropsten")) {
  etherScanApiKey = process.env.ROPSTEN_ETHERSCAN_API_KEY;
} else if (args.includes("rinkeby")) {
  etherScanApiKey = process.env.RINKEBY_ETHERSCAN_API_KEY;
} else if (args.includes("goerli")) {
  etherScanApiKey = process.env.GOERLI_ETHERSCAN_API_KEY;
} else if (args.includes("sepolia")) {
  etherScanApiKey = process.env.SEPOLIA_ETHERSCAN_API_KEY;
} else if (args.includes("arbitrumOne")) {
  etherScanApiKey = process.env.ARBITRUM_ONE_ETHERSCAN_API_KEY;
} else if (args.includes("arbitrumTestnet")) {
  etherScanApiKey = process.env.ARBITRUM_TESTNET_ETHERSCAN_API_KEY;
} else if (args.includes("polygon")) {
  etherScanApiKey = process.env.POLYGON_ETHERSCAN_API_KEY;
} else if (args.includes("polygonMumbai")) {
  etherScanApiKey = process.env.POLYGON_MUMBAI_ETHERSCAN_API_KEY;
} else if (args.includes("hardhat")) {
  etherScanApiKey = process.env.RINKEBY_ETHERSCAN_API_KEY;
} else {
  console.warn(`Could not get network from args! ${args.join(", ")}`);
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  paths: {
    sources: "./contracts",
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5,
      },
    },
  },
  gasReporter: {
    coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY || "",
    currency: "USD",
    enabled: true,
  },
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    ropsten: {
      chainId: 3,
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumOne: {
      chainId: 42161,
      url: process.env.ARBITRUM_ONE_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumTestnet: {
      chainId: 421611,
      url: process.env.ARBITRUM_TESTNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      chainId: 137,
      url: process.env.POLYGON_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    polygonMumbai: {
      chainId: 80001,
      url: process.env.POLYGON_MUMBAI_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
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
