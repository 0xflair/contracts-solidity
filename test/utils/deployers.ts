import { BigNumberish, BytesLike, utils } from "ethers";
import hre, { getUnnamedAccounts, deployments, ethers } from "hardhat";
import { deployPermanentContract } from "../../hardhat.util";
import {
  ERC721ShareInstantStream,
  ERC721EqualInstantStream,
  ERC721ManagedPrefixedCollection,
  ERC721SimpleSalesCollection,
  ERC721ASimpleSalesCollection,
  ERC721SimpleSalesCollection__factory,
  ERC721ASimpleSalesCollection__factory,
} from "../../typechain";

export const deploySharedInstantStream = async function (args?: {
  ticketToken?: string;
  tokenIds?: BigNumberish[];
  shares?: BigNumberish[];
  lockedUntilTimestamp?: BigNumberish;
}): Promise<ERC721ShareInstantStream> {
  const accounts = await getUnnamedAccounts();
  const nowMinusOneDayUnix =
    Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60;
  const ticketToken = await hre.ethers.getContract("TestERC721", accounts[0]);

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721ShareInstantStream",
    [
      {
        // Base
        ticketToken: ticketToken.address,
        lockedUntilTimestamp: nowMinusOneDayUnix,
        // Share split extension
        tokenIds: [1, 2, 3],
        shares: [1000, 2500, 4000],
        // Lockable claim extension
        claimLockedUntil: 0,
        ...(args || {}),
      },
    ]
  )) as ERC721ShareInstantStream;
};

export const deployEqualInstantStream = async function (args?: {
  ticketToken?: string;
  totalTickets?: BigNumberish;
  lockedUntilTimestamp?: BigNumberish;
}): Promise<ERC721EqualInstantStream> {
  const accounts = await getUnnamedAccounts();
  const nowMinusOneDayUnix =
    Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60;
  const ticketToken = await hre.ethers.getContract("TestERC721", accounts[0]);

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721EqualInstantStream",
    [
      {
        // Base
        ticketToken: ticketToken.address,
        lockedUntilTimestamp: nowMinusOneDayUnix,
        // Share split extension
        totalTickets: 400,
        // Lockable claim extension
        claimLockedUntil: 0,
        ...(args || {}),
      },
    ]
  )) as ERC721EqualInstantStream;
};

export const deployManagedPrefixedCollection = async function (args?: {
  initialHolders?: BytesLike[];
  initialAmounts?: BigNumberish[];
  lockedUntilTimestamp?: BigNumberish;
}): Promise<ERC721ManagedPrefixedCollection> {
  const accounts = await getUnnamedAccounts();

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721ManagedPrefixedCollection",
    [
      {
        name: "Flair Angels",
        symbol: "ANGEL",
        placeholderURI: "ipfs://yyyyy",
        tokenURIPrefix: "ipfs://xxxxx/",
        contractURI: "ipfs://zzzzzz",
        maxSupply: 10,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 1000,
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        initialHolders: [accounts[0], accounts[1]],
        initialAmounts: [1, 1],
        ...(args || {}),
      },
    ]
  )) as ERC721ManagedPrefixedCollection;
};

export const deploySimpleSalesCollection = async function (
  mode: "normal" | "azuki",
  args?: any
): Promise<ERC721SimpleSalesCollection | ERC721ASimpleSalesCollection> {
  const accounts = await getUnnamedAccounts();

  const factory =
    mode === "azuki"
      ? "ERC721ASimpleSalesCollection"
      : "ERC721SimpleSalesCollection";

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    factory,
    [
      {
        name: "Flair Angels",
        symbol: "ANGEL",
        contractURI: "ipfs://xxxxx",
        placeholderURI: "ipfs://yyyyy",
        tokenURIPrefix: "ipfs://yyyyy",
        maxSupply: 8000,
        preSalePrice: utils.parseEther("0.06"),
        preSaleMaxMintPerWallet: 2,
        publicSalePrice: utils.parseEther("0.08"),
        publicSaleMaxMintPerTx: 10,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 250,
        proceedsRecipient: "0x0000000000000000000000000000000000000000",
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        ...(args || {}),
      },
    ]
  )) as ERC721SimpleSalesCollection | ERC721ASimpleSalesCollection;
};
