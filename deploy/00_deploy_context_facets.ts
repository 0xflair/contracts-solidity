import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC2771Context",
    [],
    {
      contract: "contracts/features/metatx/ERC2771Context.sol:ERC2771Context",
    }
  );
};

export default func;
