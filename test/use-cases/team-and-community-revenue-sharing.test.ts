import { expect } from "chai";
import { utils } from "ethers";

import { setupTest } from "../setup";
import { ZERO_ADDRESS } from "../utils/common";
import {
  deployEqualInstantStream,
  deployManagedPrefixedCollection,
  deploySharedInstantStream,
  deploySimpleSalesCollection,
} from "../utils/deployers";

describe("Team and Community Revenue Sharing", function () {
  ["normal", "azuki"].forEach((collectionMode) => {
    describe(`when mode is ${collectionMode}: `, () => {
      it("should create a share-based stream with 2 founders and a community equal-instant stream", async function () {
        const { userA, userB } = await setupTest();

        const communityStream = await deployEqualInstantStream();
        const stakeholderRegistry = await deployManagedPrefixedCollection({
          initialHolders: [
            userA.signer.address,
            userB.signer.address,
            communityStream.address,
          ],
          initialAmounts: [1, 1, 1],
        });
        const primaryStream = await deploySharedInstantStream({
          ticketToken: stakeholderRegistry.address,
          tokenIds: [0, 1, 2],
          shares: [20, 30, 50],
        });

        expect(await primaryStream.totalShares()).to.equal(100);

        expect(
          await stakeholderRegistry.balanceOf(userA.signer.address)
        ).to.equal(1);
        expect(
          await stakeholderRegistry.balanceOf(userB.signer.address)
        ).to.equal(1);
        expect(
          await stakeholderRegistry.balanceOf(communityStream.address)
        ).to.equal(1);

        expect(await stakeholderRegistry.ownerOf(0)).to.equal(
          userA.signer.address
        );
        expect(await stakeholderRegistry.ownerOf(1)).to.equal(
          userB.signer.address
        );
        expect(await stakeholderRegistry.ownerOf(2)).to.equal(
          communityStream.address
        );
      });

      it("it should create collection and set primary share-based stream as proceeds recipient", async function () {
        const { deployer, userA, userB } = await setupTest();

        const communityStream = await deployEqualInstantStream();
        const stakeholderRegistry = await deployManagedPrefixedCollection({
          initialHolders: [
            userA.signer.address,
            userB.signer.address,
            communityStream.address,
          ],
          initialAmounts: [1, 1, 1],
        });
        const primaryStream = await deploySharedInstantStream({
          ticketToken: stakeholderRegistry.address,
          tokenIds: [0, 1, 2],
          shares: [20, 30, 50],
        });

        const collection = await deploySimpleSalesCollection(
          collectionMode as any
        );

        await collection
          .connect(deployer.signer)
          .setWithdrawRecipient(primaryStream.address);
        await collection.connect(deployer.signer).togglePublicSaleStatus(true);

        await collection
          .connect(userA.signer)
          .mintPublicSale(userA.signer.address, 10, {
            value: utils.parseEther("0.8"),
          });

        expect(
          await primaryStream.provider.getBalance(primaryStream.address)
        ).to.equal(0);
        expect(
          await collection.provider.getBalance(collection.address)
        ).to.equal(utils.parseEther("0.8"));

        await collection
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0.8")]);

        expect(
          await primaryStream.provider.getBalance(primaryStream.address)
        ).to.equal(utils.parseEther("0.8"));
        expect(
          await collection.provider.getBalance(collection.address)
        ).to.equal(0);
      });

      it("it should claim shares as one of EOA wallets", async function () {
        const { deployer, userA, userB } = await setupTest();

        const communityStream = await deployEqualInstantStream();
        const stakeholderRegistry = await deployManagedPrefixedCollection({
          initialHolders: [
            userA.signer.address,
            userB.signer.address,
            communityStream.address,
          ],
          initialAmounts: [1, 1, 1],
        });
        const primaryStream = await deploySharedInstantStream({
          ticketToken: stakeholderRegistry.address,
          tokenIds: [0, 1, 2],
          shares: [20, 30, 50],
        });

        const collection = await deploySimpleSalesCollection(
          collectionMode as any
        );

        await collection
          .connect(deployer.signer)
          .setWithdrawRecipient(primaryStream.address);
        await collection.connect(deployer.signer).togglePublicSaleStatus(true);

        await collection
          .connect(userA.signer)
          .mintPublicSale(userA.signer.address, 10, {
            value: utils.parseEther("0.8"),
          });

        await collection
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0.8")]);

        await expect(
          await primaryStream.connect(userB.signer)["claim(uint256)"](1)
        ).to.changeEtherBalances([userB.signer], [utils.parseEther("0.24")]);

        expect(
          await primaryStream.provider.getBalance(primaryStream.address)
        ).to.equal(utils.parseEther("0.56"));
      });

      it("it should claim shares on behalf of community stream", async function () {
        const { deployer, userA, userB, userC } = await setupTest();

        const communityStream = await deployEqualInstantStream();
        const stakeholderRegistry = await deployManagedPrefixedCollection({
          initialHolders: [
            userA.signer.address,
            userB.signer.address,
            communityStream.address,
          ],
          initialAmounts: [1, 1, 1],
        });
        const primaryStream = await deploySharedInstantStream({
          ticketToken: stakeholderRegistry.address,
          tokenIds: [0, 1, 2],
          shares: [20, 30, 50],
        });

        const collection = await deploySimpleSalesCollection(
          collectionMode as any
        );

        await collection
          .connect(deployer.signer)
          .setWithdrawRecipient(primaryStream.address);
        await collection.connect(deployer.signer).togglePublicSaleStatus(true);

        await collection
          .connect(userA.signer)
          .mintPublicSale(userA.signer.address, 10, {
            value: utils.parseEther("0.8"),
          });

        await collection
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0.8")]);

        await expect(
          await primaryStream
            .connect(userC.signer)
            ["claim(uint256[],address,address)"](
              [2],
              ZERO_ADDRESS,
              communityStream.address
            )
        ).to.changeEtherBalances([communityStream], [utils.parseEther("0.4")]);

        expect(
          await primaryStream.provider.getBalance(primaryStream.address)
        ).to.equal(utils.parseEther("0.4"));
        expect(
          await communityStream.provider.getBalance(communityStream.address)
        ).to.equal(utils.parseEther("0.4"));
      });

      it("it should claim equal split as a single community member holding 1 nft", async function () {
        const { deployer, userA, userB, userC, userD } = await setupTest();

        const collection = await deploySimpleSalesCollection(
          collectionMode as any
        );

        const communityStream = await deployEqualInstantStream({
          ticketToken: collection.address,
        });
        const stakeholderRegistry = await deployManagedPrefixedCollection({
          initialHolders: [
            userA.signer.address,
            userB.signer.address,
            communityStream.address,
          ],
          initialAmounts: [1, 1, 1],
        });
        const primaryStream = await deploySharedInstantStream({
          ticketToken: stakeholderRegistry.address,
          tokenIds: [0, 1, 2],
          shares: [20, 30, 50],
        });

        await collection
          .connect(deployer.signer)
          .setWithdrawRecipient(primaryStream.address);
        await collection.connect(deployer.signer).togglePublicSaleStatus(true);

        await collection
          .connect(userA.signer)
          .mintPublicSale(userA.signer.address, 10, {
            value: utils.parseEther("0.8"),
          });

        await collection
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0.8")]);

        await primaryStream
          .connect(userC.signer)
          ["claim(uint256[],address,address)"](
            [2],
            ZERO_ADDRESS,
            communityStream.address
          );

        await collection
          .connect(userD.signer)
          .mintPublicSale(userD.signer.address, 10, {
            value: utils.parseEther("0.8"),
          });

        await expect(
          await communityStream.connect(userD.signer)["claim(uint256[])"]([10])
        ).to.changeEtherBalances([userD.signer], [utils.parseEther("0.001")]);

        await expect(
          await communityStream
            .connect(userD.signer)
            ["claim(uint256[])"]([10, 11, 12])
        ).to.changeEtherBalances([userD.signer], [utils.parseEther("0.002")]);

        await expect(
          await communityStream
            .connect(userD.signer)
            ["claim(uint256[])"]([13, 14, 15, 16, 17, 18, 19])
        ).to.changeEtherBalances([userD.signer], [utils.parseEther("0.007")]);

        await expect(
          await communityStream
            .connect(userD.signer)
            ["claim(uint256[])"]([10, 11, 12, 13, 14, 15])
        ).to.changeEtherBalances([userD.signer], [utils.parseEther("0")]);
      });
    });
  });
});
