import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { deployPermanentContract } from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(hre.deployments, accounts[0], 'ERC2771Context', [], {
    contract: 'src/metatx/erc2771/ERC2771Context.sol:ERC2771Context',
  });
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC2771ContextOwnable', []);
};

export default func;
