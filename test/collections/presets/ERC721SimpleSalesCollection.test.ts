/* eslint-disable camelcase */
import { expect } from "chai";
import { utils } from "ethers";
import hre, { ethers } from "hardhat";
import {
  ERC721SimpleSalesCollection,
  ERC721SimpleSalesCollection__factory,
  ERC721ASimpleSalesCollection,
  ERC721ASimpleSalesCollection__factory,
} from "../../../typechain";

import { setupTest } from "../../setup";

export const deployCollection = async function (
  mode: "normal" | "azuki" | string,
  args?: any
): Promise<ERC721SimpleSalesCollection | ERC721ASimpleSalesCollection> {
  const ERC721SimpleSalesCollection =
    await ethers.getContractFactory<ERC721SimpleSalesCollection__factory>(
      "ERC721SimpleSalesCollection"
    );
  const ERC721ASimpleSalesCollection =
    await ethers.getContractFactory<ERC721ASimpleSalesCollection__factory>(
      "ERC721ASimpleSalesCollection"
    );

  const factory =
    mode === "azuki"
      ? ERC721ASimpleSalesCollection
      : ERC721SimpleSalesCollection;

  return await factory.deploy({
    name: "Flair Angels",
    symbol: "ANGEL",
    contractURI: "ipfs://xxxxx",
    placeholderURI: "ipfs://yyyyy",
    tokenURIPrefix: "ipfs://yyyyy",
    maxSupply: 8000,
    preSalePrice: utils.parseEther("0.06"),
    preSaleMaxMintPerWallet: 2,
    publicSalePrice: utils.parseEther("0.08"),
    publicSaleMaxMintPerTx: 10,
    defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
    defaultRoyaltyBps: 250,
    proceedsRecipient: "0x0000000000000000000000000000000000000000",
    trustedForwarder: "0x0000000000000000000000000000000000000000",
    ...(args || {}),
  });
};

describe("ERC721SimpleSalesCollection", function () {
  ["normal", "azuki"].forEach((mode) => {
    describe(`when mode is ${mode}: `, () => {
      it("should return collection info", async function () {
        const collection = await deployCollection(mode);
        const maxSupply = await collection.maxSupply();

        expect(maxSupply).to.be.equal(8000);
      });

      it("should return true when checking IRC721(A) interface", async function () {
        const collection = await deployCollection(mode);

        // ERC721PublicSaleExtension
        expect(await collection.supportsInterface("0xbf05d618")).to.be.equal(
          true
        );

        // Rarible Royalty
        expect(await collection.supportsInterface("0xcad96cca")).to.be.equal(
          true
        );

        // EIP2981 Royalty
        expect(await collection.supportsInterface("0x2a55205a")).to.be.equal(
          true
        );

        // ERC721
        expect(await collection.supportsInterface("0x80ac58cd")).to.be.equal(
          true
        );

        if (mode === "azuki") {
          // ERC721A
          expect(await collection.supportsInterface("0xc21b8f28")).to.be.equal(
            true
          );
        }
      });

      it("should create collection using factory", async function () {
        const { deployer, userA, userB } = await setupTest();

        const collection = await deployCollection(mode);
        const salt = utils.randomBytes(32);
        const data = collection.interface.encodeFunctionData("initialize", [
          {
            name: "My Test",
            symbol: "MTS",
            contractURI: "ipfs://aaaaaaa",
            placeholderURI: "ipfs://bbbbbb",
            tokenURIPrefix: "ipfs://ccccccc",
            maxSupply: 5000,
            preSalePrice: utils.parseEther("1"),
            preSaleMaxMintPerWallet: 2,
            publicSalePrice: utils.parseEther("2"),
            publicSaleMaxMintPerTx: 10,
            defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
            defaultRoyaltyBps: 250,
            proceedsRecipient: "0x0000000000000000000000000000000000000000",
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
          "ERC721SimpleSalesCollection",
          emittedAddress
        );

        expect(await collectionClone["totalSupply()"]()).to.equal(0);
        expect(await collectionClone["tokenURISuffix()"]()).to.equal(".json");

        expect(await collection.maxSupply()).to.equal(8000);
        expect(await collectionClone["maxSupply()"]()).to.equal(5000);

        expect(await collection.owner()).to.equal(deployer.signer.address);
        expect(await collectionClone["owner()"]()).to.equal(
          userB.signer.address
        );

        // ERC721
        expect(
          await collectionClone.supportsInterface("0x80ac58cd")
        ).to.be.equal(true);

        if (mode === "azuki") {
          // ERC721A
          expect(
            await collectionClone.supportsInterface("0xc21b8f28")
          ).to.be.equal(true);
        }

        // ERC721PublicSaleExtension
        expect(
          await collectionClone.supportsInterface("0xbf05d618")
        ).to.be.equal(true);

        // Rarible Royalty
        expect(
          await collectionClone.supportsInterface("0xcad96cca")
        ).to.be.equal(true);

        // EIP2981 Royalty
        expect(
          await collectionClone.supportsInterface("0x2a55205a")
        ).to.be.equal(true);
      });

      it("should prevent transfer when token is locked", async function () {
        const { deployer, userA, userB, userC } = await setupTest();

        const collection = await deployCollection(mode as any);

        await collection
          .connect(deployer.signer)
          .grantRole(
            utils.keccak256(Buffer.from("LOCKER_ROLE")),
            deployer.signer.address
          );

        await collection
          .connect(deployer.signer)
          .mintByOwner(userA.signer.address, 4);

        expect(await collection.ownerOf(2)).to.be.equal(userA.signer.address);

        await collection
          .connect(userA.signer)
          .transferFrom(userA.signer.address, userC.signer.address, 2);

        expect(await collection.ownerOf(2)).to.be.equal(userC.signer.address);

        await collection.connect(deployer.signer)["lock(uint256[])"]([2, 1]);

        await expect(
          collection
            .connect(userC.signer)
            .transferFrom(userC.signer.address, userB.signer.address, 2)
        ).to.be.revertedWith("LOCKED");

        await collection.connect(deployer.signer)["unlock(uint256[])"]([2]);

        await collection
          .connect(userC.signer)
          .transferFrom(userC.signer.address, userB.signer.address, 2);

        expect(await collection.ownerOf(2)).to.be.equal(userB.signer.address);
      });
    });
  });
});
