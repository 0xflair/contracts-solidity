/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";
import { ERC721FullFeaturedCollection__factory } from "../../../typechain";

describe("ERC721FullFeaturedCollection", function () {
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
