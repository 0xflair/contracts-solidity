// import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";

describe("ERC721SimpleRoyaltyCollection", function () {
  it("should return collection info", async function () {
    const ERC721SimpleRoyaltyCollection = await ethers.getContractFactory(
      "ERC721SimpleRoyaltyCollection"
    );
    const collection = await ERC721SimpleRoyaltyCollection.deploy(
      "Flair Angels",
      "ANGEL",
      "ipfs://xxxxx",
      "ipfs://yyyyy",
      [8000, web3.utils.toWei("0.06"), 2, web3.utils.toWei("0.08"), 10],
      "0x0000000000000000000000000000000000000000"
    );
    await collection.deployed();

    await collection.getInfo();
  });
});
