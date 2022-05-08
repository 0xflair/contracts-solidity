import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import web3 from "web3";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await hre.deployments.deploy("ERC721SimplePrefixedCollection", {
    from: accounts[0],
    args: [
      [
        "Flair Angels",
        "ANGEL",
        "ipfs://xxxxx",
        "ipfs://yyyyy",
        8000,
        web3.utils.toWei("0.06"),
        2,
        web3.utils.toWei("0.08"),
        10,
        accounts[0],
        250,
      ],
    ],
    log: true,
    estimateGasExtra: 1000000,
  });
};

export default func;
