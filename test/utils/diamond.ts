import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';

import { utils } from 'ethers';
import hre from 'hardhat';

import { Diamond } from '../../typechain';

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export type Facet =
  | string
  | {
      facetAddress: string;
      functionSelectors: string[];
    };

export type Initialization = {
  facet: string;
  function: string;
  args: any[];
};

export const encodeFunctionSignature = (signature: string) => {
  return utils.keccak256(utils.toUtf8Bytes(signature)).slice(0, 10);
};

export const deployDiamond = async (
  {
    facets = [],
    initializations = [],
  }: {
    facets?: Facet[];
    initializations?: Initialization[];
  } = { facets: [], initializations: [] },
) => {
  const accounts = await hre.getUnnamedAccounts();

  const diamondCutFacet = await hre.ethers.getContract('DiamondCut');
  const diamondLoupeFacet = await hre.ethers.getContract('DiamondLoupe');
  const erc165Facet = await hre.ethers.getContract('ERC165');
  const erc173Facet = await hre.ethers.getContract('Ownable');

  const initialFacets = await Promise.all(
    facets.map(async (facet) => {
      if (typeof facet === 'string') {
        const facetContract = await hre.ethers.getContract(facet);
        const publicFunctionSignatures = Object.keys(facetContract.functions).filter((key) => key.endsWith(')'));

        return {
          action: FacetCutAction.Add,
          facetAddress: facetContract.address,
          functionSelectors: publicFunctionSignatures.map(encodeFunctionSignature),
        };
      }

      return {
        ...facet,
        action: FacetCutAction.Add,
      };
    }),
  );

  // TODO Prepend ERC165 registration of included interfaces
  const initialCalls = await Promise.all(
    initializations.map(async (call) => {
      const facetContract = await hre.ethers.getContract(call.facet);

      if (!facetContract[call.function]) {
        throw new Error(
          `Function ${call.function} not found OR ambiguous in contract ${call.facet}, choose one of: ${Object.keys(
            facetContract.interface.functions,
          ).join(' ')}`,
        );
      }

      const initData = facetContract.interface.encodeFunctionData(call.function, call.args);
      return {
        initContract: facetContract.address,
        initData,
      };
    }),
  );

  const diamond = await hre.deployments.deploy('Diamond', {
    from: accounts[0],
    log: true,
    args: [
      // owner
      accounts[0],
      // coreFacets
      {
        diamondCutFacet: diamondCutFacet.address,
        diamondLoupeFacet: diamondLoupeFacet.address,
        erc165Facet: erc165Facet.address,
        erc173Facet: erc173Facet.address,
      },
      initialFacets,
      initialCalls,
    ],
  });

  return await hre.ethers.getContractAt<Diamond>('Diamond', diamond.address);
};
