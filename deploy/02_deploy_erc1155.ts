import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  //
  // Presets
  //
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155LockableMintable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155MintableBurnable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155SupplyLockableMintable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155SupplyLockableMintableBurnable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155SupplyMintable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155SupplyMintableBurnable",
    []
  );

  //
  // Facets
  //
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155Metadata",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155SupplyOwnable",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155TieredSales",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155Metadata",
    []
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC1155MetadataOwnable",
    []
  );
};

export default func;
