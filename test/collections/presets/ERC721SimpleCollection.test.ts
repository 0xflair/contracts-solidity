import { ethers } from "hardhat";
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
      10000
    )) as ERC721SimpleCollection;

    await collection.deployed();
  });

  it("should return collection info", async function () {
    await collection.getInfo();
  });
});
