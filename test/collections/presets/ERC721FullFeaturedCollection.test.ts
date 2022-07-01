/* eslint-disable camelcase */
import { expect } from "chai";
import { utils } from "ethers";
import { ethers } from "hardhat";
import web3 from "web3";
import hre from "hardhat";
import {
  ERC721FullFeaturedCollection,
  ERC721FullFeaturedCollection__factory,
} from "../../../typechain";

import { setupTest } from "../../setup";

const deployCollection = async function (
  args?: any
): Promise<ERC721FullFeaturedCollection> {
  const ERC721FullFeaturedCollection =
    await ethers.getContractFactory<ERC721FullFeaturedCollection__factory>(
      "ERC721FullFeaturedCollection"
    );
  return await ERC721FullFeaturedCollection.deploy({
    name: "Flair Angels",
    symbol: "ANGEL",
    contractURI: "ipfs://xxxxx",
    placeholderURI: "ipfs://yyyyy",
    maxSupply: 8000,
    preSalePrice: web3.utils.toWei("0.06"),
    preSaleMaxMintPerWallet: 2,
    publicSalePrice: web3.utils.toWei("0.08"),
    publicSaleMaxMintPerTx: 10,
    defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
    defaultRoyaltyBps: 250,
    proceedsRecipient: "0x0000000000000000000000000000000000000000",
    openSeaProxyRegistryAddress: "0x0000000000000000000000000000000000000000",
    openSeaExchangeAddress: "0x0000000000000000000000000000000000000000",
    trustedForwarder: "0x0000000000000000000000000000000000000000",
    ...(args || {}),
  });
};

describe("ERC721FullFeaturedCollection", function () {
  describe("Factory", function () {
    it("should create collection using factory", async function () {
      const { deployer, userA, userB } = await setupTest();

      const collection = await deployCollection();
      const salt = utils.randomBytes(32);
      const data = collection.interface.encodeFunctionData("initialize", [
        {
          name: "My Test",
          symbol: "MTS",
          contractURI: "ipfs://aaaaaaa",
          placeholderURI: "ipfs://bbbbbb",
          maxSupply: 5000,
          preSalePrice: web3.utils.toWei("1"),
          preSaleMaxMintPerWallet: 2,
          publicSalePrice: web3.utils.toWei("2"),
          publicSaleMaxMintPerTx: 10,
          defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
          defaultRoyaltyBps: 250,
          proceedsRecipient: "0x0000000000000000000000000000000000000000",
          openSeaProxyRegistryAddress:
            "0x0000000000000000000000000000000000000000",
          openSeaExchangeAddress: "0x0000000000000000000000000000000000000000",
          trustedForwarder: "0x0000000000000000000000000000000000000000",
        },
        userB.signer.address,
      ]);

      const predictedAddress =
        await userA.FlairFactory.predictDeterministicSimple(
          collection.address,
          salt
        );

      const result = await userA.FlairFactory.cloneDeterministicSimple(
        collection.address,
        salt,
        data
      );

      const receipt = await result.wait();
      const event = receipt?.events?.find((e) => e.event === "ProxyCreated");
      const emittedAddress = event?.args?.[1];

      expect(emittedAddress).to.equal(predictedAddress);

      const collectionClone = await hre.ethers.getContractAt(
        "ERC721FullFeaturedCollection",
        emittedAddress
      );

      expect(await collection.maxSupply()).to.equal(8000);
      expect(await collectionClone["maxSupply()"]()).to.equal(5000);

      expect(await collection.owner()).to.equal(deployer.signer.address);
      expect(await collectionClone["owner()"]()).to.equal(userB.signer.address);
    });
  });

  it("should return collection info", async function () {
    const ERC721FullFeaturedCollection =
      await ethers.getContractFactory<ERC721FullFeaturedCollection__factory>(
        "ERC721FullFeaturedCollection"
      );
    const collection = await ERC721FullFeaturedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      contractURI: "ipfs://xxxxx",
      placeholderURI: "ipfs://yyyyy",
      maxSupply: 8000,
      preSalePrice: web3.utils.toWei("0.06"),
      preSaleMaxMintPerWallet: 2,
      publicSalePrice: web3.utils.toWei("0.08"),
      publicSaleMaxMintPerTx: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 250,
      proceedsRecipient: "0x0000000000000000000000000000000000000000",
      openSeaProxyRegistryAddress: "0x0000000000000000000000000000000000000000",
      openSeaExchangeAddress: "0x0000000000000000000000000000000000000000",
      trustedForwarder: "0x0000000000000000000000000000000000000000",
    });

    await collection.deployed();

    await collection.getInfo();
  });

  it("should return true when checking IRC721 interface", async function () {
    const ERC721FullFeaturedCollection =
      await ethers.getContractFactory<ERC721FullFeaturedCollection__factory>(
        "ERC721FullFeaturedCollection"
      );
    const collection = await ERC721FullFeaturedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      contractURI: "ipfs://xxxxx",
      placeholderURI: "ipfs://yyyyy",
      maxSupply: 8000,
      preSalePrice: web3.utils.toWei("0.06"),
      preSaleMaxMintPerWallet: 2,
      publicSalePrice: web3.utils.toWei("0.08"),
      publicSaleMaxMintPerTx: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 250,
      proceedsRecipient: "0x0000000000000000000000000000000000000000",
      openSeaProxyRegistryAddress: "0x0000000000000000000000000000000000000000",
      openSeaExchangeAddress: "0x0000000000000000000000000000000000000000",
      trustedForwarder: "0x0000000000000000000000000000000000000000",
    });

    await collection.deployed();

    // ERC721
    expect(await collection.supportsInterface("0x80ac58cd")).to.be.equal(true);

    // ERC721PublicSaleExtension
    expect(await collection.supportsInterface("0xbf05d618")).to.be.equal(true);

    // Rarible Royalty
    expect(await collection.supportsInterface("0xcad96cca")).to.be.equal(true);

    // EIP2981 Royalty
    expect(await collection.supportsInterface("0x2a55205a")).to.be.equal(true);
  });
});
