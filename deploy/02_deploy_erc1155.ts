import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155Base",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155Supply",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155MintByFacet",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155MintByOwner",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155BurnByFacet",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155BurnByAccount",
    []
  );
};

export default func;
