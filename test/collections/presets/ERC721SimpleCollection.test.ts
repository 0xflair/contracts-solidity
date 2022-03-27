import { ethers } from "hardhat";
import web3 from "web3";
import { ERC721SimpleCollection } from "../../../typechain";

describe("ERC721SimpleCollection", function () {
  let collection: ERC721SimpleCollection;

  beforeEach(async () => {
    const ERC721SimpleCollectionContract = await ethers.getContractFactory(
      "ERC721SimpleCollection"
    );

    collection = (await ERC721SimpleCollectionContract.deploy(
      "Flair Angels",
      "ANGEL",
      "ipfs://xxxxx",
      "ipfs://yyyyy",
      8000,
      web3.utils.toWei("0.06"),
      2,
      web3.utils.toWei("0.08"),
      10
    )) as ERC721SimpleCollection;

    await collection.deployed();
  });

  it("should return collection info", async function () {
    await collection.getInfo();
  });
});
