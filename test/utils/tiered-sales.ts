import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumberish, BytesLike } from 'ethers';

export type Tier = {
  start: BigNumberish;
  end: BigNumberish;
  currency: string;
  price: BigNumberish;
  maxPerWallet: BigNumberish;
  merkleRoot: BytesLike;
  reserved: BigNumberish;
  maxAllocation: BigNumberish;
  signer: BytesLike;
};

export type TierTicket = {
  tierId: BigNumberish;
  minter: BytesLike;
  maxAllowance: BigNumberish;
  validUntil: BigNumberish;
};

export const EIP712_UMTX_TYPES = {
  TierTicket: [
    { name: 'tierId', type: 'uint256' },
    { name: 'minter', type: 'address' },
    { name: 'maxAllowance', type: 'uint256' },
    { name: 'validUntil', type: 'uint256' },
  ],
};

export const signTierTicket = async (
  signer: SignerWithAddress,
  chainId: number,
  ticket: TierTicket,
  verifyingContract: string,
) => {
  return await signer._signTypedData(
    {
      name: 'TieredSales',
      version: '2.x',
      chainId,
      verifyingContract,
    },
    EIP712_UMTX_TYPES,
    ticket,
  );
};
