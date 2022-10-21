import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(hre.deployments, accounts[0], 'Metadata', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'MetadataOwnable', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'TokenMetadata', []);
  await deployPermanentContract(hre.deployments, accounts[0], 'TokenMetadataOwnable', []);
};

export default func;
