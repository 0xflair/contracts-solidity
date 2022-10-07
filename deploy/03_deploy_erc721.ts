import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  //
  // Presets
  //
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC721A', []);
  // await deployPermanentContract(hre.deployments, accounts[0], 'ERC721AWithERC2771', []);
};

export default func;
