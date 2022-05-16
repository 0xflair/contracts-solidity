import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

export const delayMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  const contract = await hre.deployments.deploy("UnorderedForwarder", {
    from: accounts[0],
    args: [],
    log: true,
    estimateGasExtra: 1000000,
  });

  await delayMs(2000);

  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: [],
  });
};

export default func;
