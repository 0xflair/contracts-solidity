/* eslint-disable camelcase */
import { ethers } from "hardhat";
import { ERC721SimplePrefixedCollection } from "../../../typechain";
import { ERC721SimplePrefixedCollection__factory } from "../../../typechain/factories/ERC721SimplePrefixedCollection__factory";

describe("ERC721SimplePrefixedCollection", function () {
  let collection: ERC721SimplePrefixedCollection;

  beforeEach(async () => {
    const ERC721SimplePrefixedCollectionContract =
      await ethers.getContractFactory<ERC721SimplePrefixedCollection__factory>(
        "ERC721SimplePrefixedCollection"
      );

    collection = (await ERC721SimplePrefixedCollectionContract.deploy({
      name: "Flair Angels",
      symbol: "ANGEL",
      contractURI: "ipfs://xxxxx",
      placeholderURI: "ipfs://yyyyy",
      maxSupply: 10000,
      trustedForwarder: "0x0000000000000000000000000000000000000000",
    })) as ERC721SimplePrefixedCollection;

    await collection.deployed();
  });

  it("should return collection info", async function () {
    await collection.getInfo();
  });
});
