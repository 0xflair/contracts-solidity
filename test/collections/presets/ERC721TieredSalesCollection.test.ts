/* eslint-disable camelcase */
/* eslint-disable node/no-missing-import */
import { expect } from "chai";
import { BigNumberish, BytesLike, utils } from "ethers";
import hre, { ethers } from "hardhat";
import {
  ERC721TieredSalesCollection,
  ERC721TieredSalesCollection__factory,
  ERC721TieredSalesCollection as ERC721ATieredSalesCollection,
  ERC721TieredSalesCollection__factory as ERC721ATieredSalesCollection__factory,
} from "../../../typechain";

import { setupTest } from "../../setup";
import {
  generateAllowlistLeaf,
  generateAllowlistMerkleTree,
} from "../../utils/allowlists";
import { ZERO_ADDRESS, ZERO_BYTES32 } from "../../utils/common";

export const deployCollection = async function (
  mode: "normal" | "azuki" | string,
  args?: {
    maxSupply?: BigNumberish;
    tiers?: {
      start: BigNumberish;
      end: BigNumberish;
      currency: string;
      price: BigNumberish;
      maxPerWallet: BigNumberish;
      merkleRoot: BytesLike;
      reserved: BigNumberish;
      maxAllocation: BigNumberish;
    }[];
  }
): Promise<ERC721TieredSalesCollection | ERC721ATieredSalesCollection> {
  const ERC721TieredSalesCollection =
    await ethers.getContractFactory<ERC721TieredSalesCollection__factory>(
      "ERC721TieredSalesCollection"
    );
  const ERC721ATieredSalesCollection =
    await ethers.getContractFactory<ERC721ATieredSalesCollection__factory>(
      // "ERC721ATieredSalesCollection"
      "ERC721TieredSalesCollection"
    );

  const factory =
    mode === "azuki"
      ? ERC721ATieredSalesCollection
      : ERC721TieredSalesCollection;

  return await factory.deploy({
    name: "Flair Angels",
    symbol: "ANGEL",
    contractURI: "ipfs://xxxxx",
    placeholderURI: "ipfs://yyyyy",
    tokenURIPrefix: "ipfs://yyyyy",
    maxSupply: 8000,
    tiers: [
      {
        start: 0,
        end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60, // +10 days
        price: utils.parseEther("0.06"),
        currency: ZERO_ADDRESS,
        maxPerWallet: 5,
        merkleRoot: ZERO_BYTES32,
        reserved: 0,
        maxAllocation: 5000,
      },
      {
        start: 0,
        end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60, // +5 days
        price: utils.parseEther("0.2"),
        currency: ZERO_ADDRESS,
        maxPerWallet: 5,
        merkleRoot: ZERO_BYTES32,
        reserved: 0,
        maxAllocation: 5000,
      },
    ],
    defaultRoyaltyAddress: "0x0000000000000000000000000000000000000000",
    defaultRoyaltyBps: 250,
    proceedsRecipient: "0x0000000000000000000000000000000000000000",
    trustedForwarder: "0x0000000000000000000000000000000000000000",
    // eslint-disable-next-line
    ...(args || {}),
  });
};

describe("ERC721TieredSalesCollection", function () {
  ["normal", "azuki"].forEach((mode) => {
    describe(`when mode is ${mode}: `, () => {
      it("should return collection info", async function () {
        const collection = await deployCollection(mode);

        const info = await collection.tiers(0);

        expect(info.price).to.be.equal(utils.parseEther("0.06"));
      });

      it.skip("should return true when checking IRC721(A) interface", async function () {
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

      it.skip("should create collection using factory", async function () {
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
            tiers: [
              {
                start: 1000,
                end: 50000,
                currency: ZERO_ADDRESS,
                price: utils.parseEther("0.7"),
                maxPerWallet: 2,
                merkleRoot: ZERO_BYTES32,
                reserved: 0,
                maxAllocation: 5000,
              },
            ],
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
          "ERC721TieredSalesCollection",
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

        // ERC721TieringExtension
        expect(
          await collectionClone.supportsInterface("0x1264ddfb")
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

      it("should mint by tier when 1 tier, no allowlist, with native currency", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
          value: utils.parseEther("0.12"),
        });

        expect(await collection.ownerOf(0)).to.be.equal(userA.signer.address);
        expect(await collection.ownerOf(1)).to.be.equal(userA.signer.address);
        await expect(collection.ownerOf(2)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      });

      it("should fail when minting a non-existing tier", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await expect(
          collection.connect(userA.signer).mintByTier(555, 2, 0, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("NOT_EXISTS");
      });

      it("should fail when minting a tier that is not started yet", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) + 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("NOT_STARTED");
      });

      it("should fail when minting a tier that is already ended", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) - 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("ALREADY_ENDED");
      });

      it("should fail when minting a tier and wallet is not allowlisted", async function () {
        const { userA, userB, userC, userD } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userD.signer).onTierAllowlist(
            0,
            userD.signer.address,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userD.signer.address,
                maxAllowance: 2,
              })
            )
          )
        ).to.be.equal(false);

        await expect(
          collection.connect(userD.signer).mintByTier(
            0,
            2,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userD.signer.address,
                maxAllowance: 2,
              })
            ),
            {
              value: utils.parseEther("0.12"),
            }
          )
        ).to.be.revertedWith("NOT_ALLOWLISTED");
      });

      it("should fail when minting a tier and passed max allowance is wrong vs allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userB.signer).onTierAllowlist(
            0,
            userB.signer.address,
            5,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 3,
              })
            )
          )
        ).to.be.equal(false);

        await expect(
          collection.connect(userB.signer).mintByTier(
            0,
            2,
            5,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 3,
              })
            ),
            {
              value: utils.parseEther("0.12"),
            }
          )
        ).to.be.revertedWith("NOT_ALLOWLISTED");
      });

      it("should fail when minting a tier and amount is higher than max allowance in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            )
          )
        ).to.be.equal(true);

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            4,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            ),
            {
              value: utils.parseEther("0.24"),
            }
          )
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail when minting a tier and amount + prev mints is higher than max allowance in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userA.signer).mintByTier(
          0,
          2,
          3,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 3,
            })
          ),
          {
            value: utils.parseEther("0.12"),
          }
        );

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            2,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            ),
            {
              value: utils.parseEther("0.12"),
            }
          )
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should mint by tier when amount is equal to max per wallet even though allowance is high in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 30,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            30,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 30,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userA.signer).mintByTier(
          0,
          5,
          30,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 30,
            })
          ),
          {
            value: utils.parseEther("0.30"),
          }
        );
      });

      it("should fail when minting a tier and amount is higher than max per wallet even though allowance is high enough in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 30,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            30,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 30,
              })
            )
          )
        ).to.be.equal(true);

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            6,
            30,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 30,
              })
            ),
            {
              value: utils.parseEther("0.36"),
            }
          )
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail when minting a tier and amount + prev mints is higher than max per wallet even though allowance is high enough in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 30,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            30,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 30,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userA.signer).mintByTier(
          0,
          4,
          30,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 30,
            })
          ),
          {
            value: utils.parseEther("0.36"),
          }
        );

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            2,
            30,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 30,
              })
            ),
            {
              value: utils.parseEther("0.36"),
            }
          )
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should mint by tier multiple times until reached max allowance in allowlist", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userA.signer).onTierAllowlist(
            0,
            userA.signer.address,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userA.signer).mintByTier(
          0,
          2,
          3,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 3,
            })
          ),
          {
            value: utils.parseEther("0.18"),
          }
        );

        await collection.connect(userA.signer).mintByTier(
          0,
          1,
          3,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 3,
            })
          ),
          {
            value: utils.parseEther("0.06"),
          }
        );

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            1,
            3,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 3,
              })
            ),
            {
              value: utils.parseEther("0.06"),
            }
          )
        ).to.be.revertedWith("MAXED_ALLOWANCE");
      });

      it("should fail to mint by tier if tier allocation is filled up", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 8,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 8,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("1"),
              reserved: 0,
              maxAllocation: 5,
            },
          ],
        });

        await collection.connect(userA.signer).mintByTier(
          0,
          5,
          8,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 8,
            })
          ),
          {
            value: utils.parseEther("5"),
          }
        );

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            1,
            8,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userA.signer.address,
                maxAllowance: 8,
              })
            ),
            {
              value: utils.parseEther("1"),
            }
          )
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");
      });

      it("should fail when minting a tier with allowlist without proof", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 1, 1, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("NOT_ALLOWLISTED");
      });

      it("should fail when minting a tier with allowlist with proof of another wallet", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userB.signer).onTierAllowlist(
            0,
            userB.signer.address,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 2,
              })
            )
          )
        ).to.be.equal(true);

        await expect(
          collection.connect(userA.signer).mintByTier(
            0,
            2,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 2,
              })
            ),
            {
              value: utils.parseEther("0.12"),
            }
          )
        ).to.be.revertedWith("NOT_ALLOWLISTED");
      });

      it("should mint by tier when wallet is allowlisted", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userB.signer).onTierAllowlist(
            0,
            userB.signer.address,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 2,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userB.signer).mintByTier(
          0,
          2,
          2,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userB.signer.address,
              maxAllowance: 2,
            })
          ),
          {
            value: utils.parseEther("0.12"),
          }
        );
      });

      it("should mint by tier when wallet is allowlisted one by one", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userB.signer).onTierAllowlist(
            0,
            userB.signer.address,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 2,
              })
            )
          )
        ).to.be.equal(true);

        await collection.connect(userB.signer).mintByTier(
          0,
          1,
          2,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userB.signer.address,
              maxAllowance: 2,
            })
          ),
          {
            value: utils.parseEther("0.06"),
          }
        );

        await collection.connect(userB.signer).mintByTier(
          0,
          1,
          2,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userB.signer.address,
              maxAllowance: 2,
            })
          ),
          {
            value: utils.parseEther("0.06"),
          }
        );
      });

      it("should fail when minting a tier when max per wallet is reached", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await collection.connect(userA.signer).mintByTier(0, 5, 0, [], {
          value: utils.parseEther("0.30"),
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 1, 0, [], {
            value: utils.parseEther("0.06"),
          })
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail when minting a tier and asking for more than remaining per-wallet allocation", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await collection.connect(userA.signer).mintByTier(0, 4, 0, [], {
          value: utils.parseEther("0.24"),
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail when minting a tier and amount + prev mints is asking for more than remaining per-wallet allocation", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await collection.connect(userA.signer).mintByTier(0, 4, 0, [], {
          value: utils.parseEther("0.24"),
        });

        await expect(
          collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
            value: utils.parseEther("0.12"),
          })
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail when minting a tier and not enough ether is sent", async function () {
        const { userA } = await setupTest();

        const collection = await deployCollection(mode as any);

        await expect(
          collection.connect(userA.signer).mintByTier(0, 2, 0, [], {
            value: utils.parseEther("0.11"),
          })
        ).to.be.revertedWith("INSUFFICIENT_AMOUNT");
      });

      it("should mint by tier when multiple tiers and have dedicated max per wallet", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 3,
          },
          {
            address: userB.signer.address,
            maxAllowance: 2,
          },
          {
            address: userC.signer.address,
            maxAllowance: 4,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 3,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 0,
              maxAllocation: 5000,
            },
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.2"),
              reserved: 0,
              maxAllocation: 5000,
            },
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 1,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.01"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        await collection.connect(userB.signer).mintByTier(
          0,
          2,
          2,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userB.signer.address,
              maxAllowance: 2,
            })
          ),
          {
            value: utils.parseEther("0.12"),
          }
        );

        await expect(
          collection.connect(userB.signer).mintByTier(
            0,
            1,
            2,
            mkt.getHexProof(
              generateAllowlistLeaf({
                address: userB.signer.address,
                maxAllowance: 2,
              })
            ),
            {
              value: utils.parseEther("0.06"),
            }
          )
        ).to.be.revertedWith("MAXED_ALLOWANCE");

        await collection.connect(userB.signer).mintByTier(1, 5, 0, [], {
          value: utils.parseEther("1"),
        });

        await expect(
          collection.connect(userB.signer).mintByTier(1, 1, 0, [], {
            value: utils.parseEther("0.6"),
          })
        ).to.be.revertedWith("EXCEEDS_MAX");

        await collection.connect(userB.signer).mintByTier(2, 1, 0, [], {
          value: utils.parseEther("0.01"),
        });

        await expect(
          collection.connect(userB.signer).mintByTier(2, 1, 0, [], {
            value: utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("EXCEEDS_MAX");
      });

      it("should fail to mint by tier if remaining allocation is fully reserved (example A)", async function () {
        const { userA, userB, userC } = await setupTest();

        const mkt = generateAllowlistMerkleTree([
          {
            address: userA.signer.address,
            maxAllowance: 8,
          },
          {
            address: userB.signer.address,
            maxAllowance: 8,
          },
          {
            address: userC.signer.address,
            maxAllowance: 8,
          },
        ]);
        const collection = await deployCollection(mode as any, {
          maxSupply: 10,
          tiers: [
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 3,
              merkleRoot: mkt.getHexRoot(),
              price: utils.parseEther("0.06"),
              reserved: 5,
              maxAllocation: 5000,
            },
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 8,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.2"),
              reserved: 0,
              maxAllocation: 5000,
            },
            {
              start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
              end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
              currency: ZERO_ADDRESS,
              maxPerWallet: 5,
              merkleRoot: ZERO_BYTES32,
              price: utils.parseEther("0.01"),
              reserved: 0,
              maxAllocation: 5000,
            },
          ],
        });

        expect(
          await collection.connect(userB.signer).remainingForTier(0)
        ).to.be.equal(10);
        expect(
          await collection.connect(userB.signer).remainingForTier(1)
        ).to.be.equal(5);
        expect(
          await collection.connect(userB.signer).remainingForTier(2)
        ).to.be.equal(5);

        await collection.connect(userA.signer).mintByTier(
          0,
          2,
          8,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userA.signer.address,
              maxAllowance: 8,
            })
          ),
          {
            value: utils.parseEther("0.12"),
          }
        );

        expect(
          await collection.connect(userB.signer).remainingForTier(0)
        ).to.be.equal(8);
        expect(
          await collection.connect(userB.signer).remainingForTier(1)
        ).to.be.equal(5);
        expect(
          await collection.connect(userB.signer).remainingForTier(2)
        ).to.be.equal(5);

        await collection.connect(userB.signer).mintByTier(
          1,
          3,
          8,
          mkt.getHexProof(
            generateAllowlistLeaf({
              address: userB.signer.address,
              maxAllowance: 8,
            })
          ),
          {
            value: utils.parseEther("0.6"),
          }
        );

        expect(
          await collection.connect(userB.signer).totalSupply()
        ).to.be.equal(5);
        expect(await collection.connect(userB.signer).tierMints(0)).to.be.equal(
          2
        );
        expect(await collection.connect(userB.signer).tierMints(1)).to.be.equal(
          3
        );
        expect(await collection.connect(userB.signer).tierMints(2)).to.be.equal(
          0
        );
        expect(
          await collection.connect(userB.signer).remainingForTier(0)
        ).to.be.equal(5);
        expect(
          await collection.connect(userB.signer).remainingForTier(1)
        ).to.be.equal(2);
        expect(
          await collection.connect(userB.signer).remainingForTier(2)
        ).to.be.equal(2);

        await collection.connect(userC.signer).mintByTier(2, 2, 0, [], {
          value: utils.parseEther("0.02"),
        });

        expect(
          await collection.connect(userB.signer).totalSupply()
        ).to.be.equal(7);

        await expect(
          collection.connect(userB.signer).mintByTier(1, 1, 0, [], {
            value: utils.parseEther("0.2"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");

        await expect(
          collection.connect(userB.signer).mintByTier(2, 1, 0, [], {
            value: utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");
      });

      it("should fail to mint by tier if remaining allocation is fully reserved (example B)", async function () {
        const { userA, userB } = await setupTest();

        const collection = (
          await deployCollection(mode as any, {
            maxSupply: 20,
            tiers: [
              {
                start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
                end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
                currency: ZERO_ADDRESS,
                maxPerWallet: 10,
                merkleRoot: ZERO_BYTES32,
                price: utils.parseEther("1"),
                reserved: 5,
                maxAllocation: 5000,
              },
              {
                start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
                end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
                currency: ZERO_ADDRESS,
                maxPerWallet: 10,
                merkleRoot: ZERO_BYTES32,
                price: utils.parseEther("1"),
                reserved: 0,
                maxAllocation: 5000,
              },
              {
                start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
                end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
                currency: ZERO_ADDRESS,
                maxPerWallet: 10,
                merkleRoot: ZERO_BYTES32,
                price: utils.parseEther("1"),
                reserved: 0,
                maxAllocation: 5000,
              },
              {
                start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
                end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
                currency: ZERO_ADDRESS,
                maxPerWallet: 10,
                merkleRoot: ZERO_BYTES32,
                price: utils.parseEther("1"),
                reserved: 3,
                maxAllocation: 5000,
              },
            ],
          })
        ).connect(userB.signer);

        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["17", "12", "12", "15"]);

        await collection.connect(userA.signer).mintByTier(0, 3, 100, [], {
          value: utils.parseEther("3"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["14", "12", "12", "15"]);

        await collection.connect(userA.signer).mintByTier(1, 4, 100, [], {
          value: utils.parseEther("4"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["10", "8", "8", "11"]);

        await collection.connect(userA.signer).mintByTier(2, 7, 100, [], {
          value: utils.parseEther("7"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["3", "1", "1", "4"]);

        await collection.connect(userA.signer).mintByTier(3, 2, 100, [], {
          value: utils.parseEther("2"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["3", "1", "1", "2"]);

        await collection.connect(userA.signer).mintByTier(0, 2, 100, [], {
          value: utils.parseEther("2"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["1", "1", "1", "2"]);

        await collection.connect(userA.signer).mintByTier(2, 1, 100, [], {
          value: utils.parseEther("1"),
        });
        expect([
          (await collection.remainingForTier(0)).toString(),
          (await collection.remainingForTier(1)).toString(),
          (await collection.remainingForTier(2)).toString(),
          (await collection.remainingForTier(3)).toString(),
        ]).to.deep.equal(["0", "0", "0", "1"]);

        await expect(
          collection.connect(userB.signer).mintByTier(0, 1, 100, [], {
            value: utils.parseEther("1"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");

        await expect(
          collection.connect(userB.signer).mintByTier(1, 1, 100, [], {
            value: utils.parseEther("1"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");

        await expect(
          collection.connect(userB.signer).mintByTier(2, 1, 100, [], {
            value: utils.parseEther("1"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");

        await collection.connect(userB.signer).mintByTier(3, 1, 100, [], {
          value: utils.parseEther("1"),
        });

        await expect(
          collection.connect(userB.signer).mintByTier(3, 1, 100, [], {
            value: utils.parseEther("1"),
          })
        ).to.be.revertedWith("EXCEEDS_ALLOCATION");
      });

      // TODO add erc20 payment tests
    });
  });
});
