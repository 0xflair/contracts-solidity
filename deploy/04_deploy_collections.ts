import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  // Deploy as master contract useful for EIP1167-based clones
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721SimpleSalesCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        placeholderURI: "ipfs://placeholderURI",
        tokenURIPrefix: "ipfs://tokenURIPrefix/",
        maxSupply: 0,
        preSalePrice: 0,
        preSaleMaxMintPerWallet: 0,
        publicSalePrice: 0,
        publicSaleMaxMintPerTx: 10,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        proceedsRecipient: "0x0000000000000000000000000000000000000000",
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721TieredSalesCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        placeholderURI: "ipfs://placeholderURI",
        tokenURIPrefix: "ipfs://tokenURIPrefix/",
        maxSupply: 0,
        tiers: [],
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        proceedsRecipient: "0x0000000000000000000000000000000000000000",
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721ManagedPrefixedCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        placeholderURI: "ipfs://placeholderURI",
        tokenURIPrefix: "ipfs://tokenURIPrefix/",
        maxSupply: 0,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        initialHolders: [],
        initialAmounts: [],
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721OneOfOneCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        maxSupply: 0,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721ASimpleSalesCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        placeholderURI: "ipfs://placeholderURI",
        tokenURIPrefix: "ipfs://tokenURIPrefix/",
        maxSupply: 0,
        preSalePrice: 0,
        preSaleMaxMintPerWallet: 0,
        publicSalePrice: 0,
        publicSaleMaxMintPerTx: 10,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        proceedsRecipient: "0x0000000000000000000000000000000000000000",
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721ATieredSalesCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        placeholderURI: "ipfs://placeholderURI",
        tokenURIPrefix: "ipfs://tokenURIPrefix/",
        maxSupply: 0,
        tiers: [],
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        proceedsRecipient: "0x0000000000000000000000000000000000000000",
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721AOneOfOneCollection",
    [
      {
        name: "Collection",
        symbol: "COL",
        contractURI: "ipfs://contractURI",
        maxSupply: 0,
        defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
        defaultRoyaltyBps: 0,
        trustedForwarder: "0x0000000000000000000000000000000000000000",
        licenseVersion: 0,
      },
    ]
  );
};

export default func;
