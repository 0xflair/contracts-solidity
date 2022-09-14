import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {deployPermanentContract} from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(hre.deployments, accounts[0], 'Ownable', [], {
    contract: 'contracts/access/ownable/Ownable.sol:Ownable',
  });
};

export default func;
