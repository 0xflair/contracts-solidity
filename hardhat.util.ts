import {Fragment} from 'ethers/lib/utils';
import fs from 'fs';
import hre from 'hardhat';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployOptions} from 'hardhat-deploy/types';

export const deployUpgradableContract = async (
  deployments: HardhatRuntimeEnvironment['deployments'],
  from: string,
  owner: string,
  name: string,
  args: any[],
) => {
  const {deploy} = deployments;

  const contract = await deploy(name, {
    from,
    log: true,
    proxy: {
      owner,
      proxyContract: 'UUPSProxy',
      execute: {
        init: {methodName: 'initialize', args},
      },
    },
    estimateGasExtra: 1000000,
  });

  if (hre.hardhatArguments.network === 'hardhat') return contract;

  const proxyAbiPath = `${__dirname}/deployments/${hre.hardhatArguments.network}/${name}_Proxy.json`;
  const proxyContractAbi = JSON.parse(fs.readFileSync(proxyAbiPath, 'utf8'));

  if (!proxyContractAbi.abi.find((i: Fragment) => i.name && i.name === 'upgradeTo')) {
    proxyContractAbi.abi.push(
      {
        inputs: [
          {
            internalType: 'address',
            name: 'newImplementation',
            type: 'address',
          },
        ],
        name: 'upgradeTo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'newImplementation',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        name: 'upgradeToAndCall',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    );

    fs.writeFileSync(proxyAbiPath, JSON.stringify(proxyContractAbi, null, 2));
  }

  return contract;
};

export const deployPermanentContract = async (
  deployments: HardhatRuntimeEnvironment['deployments'],
  from: string,
  name: string,
  args: any[],
  additionalOptions: Partial<DeployOptions> = {},
) => {
  const {deploy} = deployments;
  const result = await deploy(name, {
    from,
    args,
    log: true,
    estimateGasExtra: 1000000,
    ...additionalOptions,
  });

  return hre.ethers.getContractAt(
    additionalOptions && additionalOptions.contract ? additionalOptions.contract.toString() : name,
    result.address,
  );
};
