import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  //
  // Presets
  //
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155WithERC2771', []);

  //
  // Facets
  //

  // Supply
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155SupplyOwnable', []);

  // Metadata
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155Metadata', []);

  // Burnable
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155BurnableOwnable', []);

  // Lockable

  // TODO
  // await deployPermanentContract(
  //   hre.deployments,
  //   accounts[0],
  //   accounts[0],
  //   "ERC1155LockByOwner",
  //   []
  // );
  // await deployPermanentContract(
  //   hre.deployments,
  //   accounts[0],
  //   accounts[0],
  //   "ERC1155LockByRole",
  //   []
  // );

  // Mintable
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155MintByOwner', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155MintByOwnerERC2771', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155MintByRole', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155MintByRoleERC2771', []);

  // Tiered Sales
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155TieredSales', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155TieredSalesERC2771', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC1155TieredSalesOwnable', []);
};

export default func;
