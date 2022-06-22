/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers, getUnnamedAccounts } from "hardhat";
import { ERC721ManagedPrefixedCollection__factory } from "../../../typechain/factories/ERC721ManagedPrefixedCollection__factory";

describe("ERC721ManagedPrefixedCollection", function () {
  it("should mint initial tokens during deployment", async function () {
    const [deployer, userA, userB] = await getUnnamedAccounts();

    const ERC721ManagedPrefixedCollection =
      await ethers.getContractFactory<ERC721ManagedPrefixedCollection__factory>(
        "ERC721ManagedPrefixedCollection"
      );
    const collection = await ERC721ManagedPrefixedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      baseURI: "ipfs://xxxxx/",
      placeholderURI: "ipfs://yyyyy",
      contractURI: "ipfs://zzzzzz",
      maxSupply: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 1000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
      initialHolders: [userA, userB],
      initialAmounts: [2, 1],
    });

    await collection.deployed();

    expect(await collection.balanceOf(userA)).to.eq(2);
    expect(await collection.balanceOf(userB)).to.eq(1);
  });

  it("should use the correct baseURI when provided on deployment", async function () {
    const ERC721ManagedPrefixedCollection =
      await ethers.getContractFactory<ERC721ManagedPrefixedCollection__factory>(
        "ERC721ManagedPrefixedCollection"
      );
    const collection = await ERC721ManagedPrefixedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      baseURI: "ipfs://xxxxx/",
      placeholderURI: "ipfs://yyyyy",
      contractURI: "ipfs://zzzzzz",
      maxSupply: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 1000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
      initialHolders: [],
      initialAmounts: [],
    });

    await collection.deployed();

    expect(await collection.tokenURI("11")).to.eq(`ipfs://xxxxx/11`);
  });

  it("should use the placeholder URI when baseURI is not provided on deployment", async function () {
    const ERC721ManagedPrefixedCollection =
      await ethers.getContractFactory<ERC721ManagedPrefixedCollection__factory>(
        "ERC721ManagedPrefixedCollection"
      );
    const collection = await ERC721ManagedPrefixedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      baseURI: "",
      placeholderURI: "ipfs://yyyyy",
      contractURI: "ipfs://zzzzzz",
      maxSupply: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 1000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
      initialHolders: [],
      initialAmounts: [],
    });

    await collection.deployed();

    expect(await collection.tokenURI("11")).to.eq(`ipfs://yyyyy`);
  });

  it("should allow contract owner to transfer when collection is managed", async function () {
    const [deployer, userA, userB] = await getUnnamedAccounts();

    const ERC721ManagedPrefixedCollection =
      await ethers.getContractFactory<ERC721ManagedPrefixedCollection__factory>(
        "ERC721ManagedPrefixedCollection"
      );
    const collection = await ERC721ManagedPrefixedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      baseURI: "",
      placeholderURI: "ipfs://yyyyy",
      contractURI: "ipfs://zzzzzz",
      maxSupply: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 1000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
      initialHolders: [userA],
      initialAmounts: [1],
    });

    await collection.deployed();
    await collection.transferFrom(userA, userB, 1);

    expect(await collection.ownerOf("1")).to.eq(userB);
  });

  it("should reject contract owner to transfer when collection is not managed anymore", async function () {
    const [deployer, userA, userB] = await getUnnamedAccounts();

    const ERC721ManagedPrefixedCollection =
      await ethers.getContractFactory<ERC721ManagedPrefixedCollection__factory>(
        "ERC721ManagedPrefixedCollection"
      );
    const collection = await ERC721ManagedPrefixedCollection.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      baseURI: "",
      placeholderURI: "ipfs://yyyyy",
      contractURI: "ipfs://zzzzzz",
      maxSupply: 10,
      defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
      defaultRoyaltyBps: 1000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
      initialHolders: [userA],
      initialAmounts: [1],
    });

    await collection.deployed();

    await collection.revokeManagementPower();

    await expect(collection.transferFrom(userA, userB, 1)).to.be.revertedWith(
      "ERC721: transfer caller is not owner nor approved"
    );

    expect(await collection.ownerOf("1")).to.eq(userA);
  });
});
