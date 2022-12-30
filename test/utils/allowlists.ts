import { BigNumberish, utils } from 'ethers';
import keccak256 from 'keccak256';
import { MerkleTree as MerkleTreeJs } from 'merkletreejs';

export const generateAllowlistLeaf = (args: { address: string; maxAllowance: BigNumberish }) => {
  return utils.solidityKeccak256(['address', 'uint256'], [args.address, args.maxAllowance]);
};

export const generateAllowlistMerkleTree = (items: { address: string; maxAllowance: BigNumberish }[]) => {
  const leafNodes = items.map(generateAllowlistLeaf);
  const merkleTree = new MerkleTreeJs(leafNodes, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  return merkleTree;
};
