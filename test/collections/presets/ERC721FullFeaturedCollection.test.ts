// import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";

describe("ERC721FullFeaturedCollection", function () {
  it("should return collection info", async function () {
    const ERC721FullFeaturedCollection = await ethers.getContractFactory(
      "ERC721FullFeaturedCollection"
    );
    const collection = await ERC721FullFeaturedCollection.deploy(
      "Flair Angels",
      "ANGEL",
      "ipfs://xxxxx",
      "ipfs://yyyyy",
      [8000, web3.utils.toWei("0.06"), 2, web3.utils.toWei("0.08"), 10],
      [
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
      ]
    );
    await collection.deployed();

    await collection.getInfo();
  });
});
