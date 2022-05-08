import { BigNumberish, BytesLike, Signer } from "ethers";

export type UnorderedMetaTransaction = {
  from: string;
  to: string;
  value: BigNumberish;
  minGasPrice: BigNumberish;
  maxGasPrice: BigNumberish;
  expiresAt: BigNumberish;
  nonce: BigNumberish;
  data: BytesLike;
};

export const EIP712_UMTX_TYPES = {
  UnorderedMetaTransaction: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "minGasPrice", type: "uint256" },
    { name: "maxGasPrice", type: "uint256" },
    { name: "expiresAt", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
};

export const signUnorderedMetaTransaction = async (
  account: Signer,
  chainId: number,
  metaTransaction: UnorderedMetaTransaction,
  verifyingContract: string
) => {
  // @ts-ignore
  return await account._signTypedData(
    {
      name: "UnorderedForwarder",
      version: "0.0.1",
      chainId,
      verifyingContract,
    },
    EIP712_UMTX_TYPES,
    metaTransaction
  );
};
