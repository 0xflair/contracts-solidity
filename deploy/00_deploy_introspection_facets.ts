import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {deployPermanentContract} from '../hardhat.util';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  await deployPermanentContract(hre.deployments, accounts[0], 'ERC165', [], {
    contract: 'contracts/introspection/ERC165.sol:ERC165',
  });
  await deployPermanentContract(hre.deployments, accounts[0], 'ERC165Ownable', []);
};

export default func;
