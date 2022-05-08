import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await hre.deployments.deploy("UnorderedForwarder", {
    from: accounts[0],
    args: [],
    log: true,
    estimateGasExtra: 1000000,
  });
};

export default func;
