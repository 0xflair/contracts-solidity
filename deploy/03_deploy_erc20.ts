import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  //
  // Presets
  //
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20', []);

  //
  // Facets
  //

  // Metadata
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20Metadata', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20MetadataOwnable', []);

  // Supply
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20SupplyOwnable', []);

  // Mintable
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20MintableOwnable', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20MintableOwnableERC2771', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20MintableRoleBased', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20MintableRoleBasedERC2771', []);

  // Tiered Sales
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20TieredSales', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC20TieredSalesERC2771', []);
};

export default func;
