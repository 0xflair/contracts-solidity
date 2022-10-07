import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  //
  // Presets
  //
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721A', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721AWithERC2771', []);

  //
  // Facets
  //

  // Metadata
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721Metadata', []);

  // Supply
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721SupplyOwnable', []);

  // Mintable
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721MintByOwner', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721MintByOwnerERC2771', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721MintByRole', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721MintByRoleERC2771', []);

  // Lockable
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721LockByOwner', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721LockByRole', []);

  // Tiered Sales
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721TieredSales', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721TieredSalesERC2771', []);
};

export default func;
