import { utils } from "ethers";
import { MerkleTree as MerkleTreeJs } from "merkletreejs";
import keccak256 from "keccak256";

export const generateAllowlistLeaf = (args: {
  address: string;
  maxAllowance: number;
}) => {
  return utils.solidityKeccak256(
    ["address", "uint256"],
    [args.address, args.maxAllowance]
  );
};

export const generateAllowlistMerkleTree = (
  items: { address: string; maxAllowance: number }[]
) => {
  const leafNodes = items.map(generateAllowlistLeaf);
  const merkleTree = new MerkleTreeJs(leafNodes, keccak256, {
    sort: true,
    sortLeaves: true,
    sortPairs: true,
  });

  return merkleTree;
};
