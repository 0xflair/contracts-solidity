import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import web3 from "web3";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await hre.deployments.deploy("ERC721SimpleCollection", {
    from: accounts[0],
    args: [
      "Flair Angels",
      "ANGEL",
      "ipfs://xxxxx",
      "ipfs://yyyyy",
      8000,
      web3.utils.toWei("0.06"),
      2,
      web3.utils.toWei("0.08"),
      10,
    ],
    log: true,
    estimateGasExtra: 1000000,
  });
};

export default func;

// const path = require('path');
// const fs = require('fs');

// const collectionConfig = require('../collection.config');

// const distDirectory = path.resolve(__dirname, '../dist');

// module.exports = async ({ getNamedAccounts, deployments }) => {
//   const { deployer } = await getNamedAccounts();

//   const contractURI = fs
//     .readFileSync(`${distDirectory}/.contractURI`)
//     .toString();
//   const placeholderURI = fs
//     .readFileSync(`${distDirectory}/.placeholderURI`)
//     .toString();

//   await deployments.deploy(ERC721SimpleCollection, {
//     from: deployer,
//     args: [
//       collectionConfig.name,
//       collectionConfig.symbol,
//       collectionConfig.price,
//       collectionConfig.maxTotalMint,
//       collectionConfig.maxPreSaleMintPerAddress,
//       collectionConfig.maxMintPerTransaction,
//       collectionConfig.maxAllowedGasFee,
//       contractURI,
//       placeholderURI,
//       collectionConfig.royaltyFeeRecipient,
//       collectionConfig.openseaRegistryAddress,
//     ],
//     log: true,
//     estimateGasExtra: 1000000,
//   });
// };

// module.exports.tags = ['collection'];
