// import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";

describe("ERC721SimpleCollection", function () {
  it("should return collection info", async function () {
    const ERC721SimpleCollection = await ethers.getContractFactory(
      "ERC721SimpleCollection"
    );
    const collection = await ERC721SimpleCollection.deploy(
      "Flair Angels",
      "ANGEL",
      "ipfs://xxxxx",
      "ipfs://yyyyy",
      8000,
      web3.utils.toWei("0.06"),
      2,
      web3.utils.toWei("0.08"),
      10
    );
    await collection.deployed();

    await collection.getInfo();
  });
});
