import { expect } from "chai";
import { utils, BigNumberish } from "ethers";
import hre, { deployments, getUnnamedAccounts } from "hardhat";

import { ERC721ShareholderDistributor } from "../../../../typechain";
import { deployPermanentContract } from "../../../../hardhat.util";

import { setupTest } from "../../../setup";
import { increaseTime, ZERO_ADDRESS } from "../../../utils/common";

const deployDistributor = async function (args?: {
  ticketToken?: string;
  tokenIds?: BigNumberish[];
  shares?: BigNumberish[];
  lockedUntilTimestamp?: BigNumberish;
}): Promise<ERC721ShareholderDistributor> {
  const accounts = await getUnnamedAccounts();
  const nowUnix = Math.floor(new Date().getTime() / 1000);
  const ticketToken = await hre.ethers.getContract("TestERC721", accounts[0]);

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721ShareholderDistributor",
    [
      {
        ticketToken: ticketToken.address,
        tokenIds: [1, 2, 3, 4],
        shares: [2500, 2500, 2500, 2500],
        lockedUntilTimestamp: nowUnix,
        ...(args || {}),
      },
    ]
  )) as ERC721ShareholderDistributor;
};

describe("ERC721ShareholderDistributor", function () {
  describe("Native Token Streams", function () {
    it("should top-up a native-token stream", async function () {
      const { userA } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      expect(await distributor["streamTotalSupply()"]()).to.equal(
        utils.parseEther("4.4")
      );

      expect(
        await distributor["streamTotalSupply(address)"](ZERO_ADDRESS)
      ).to.equal(utils.parseEther("4.4"));
    });

    it("should top-up multiple times", async function () {
      const { userA } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("3.4"),
      });

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("1.1"),
      });

      expect(await distributor["streamTotalSupply()"]()).to.equal(
        utils.parseEther("4.5")
      );

      expect(
        await distributor["streamTotalSupply(address)"](ZERO_ADDRESS)
      ).to.equal(utils.parseEther("4.5"));
    });

    it("should claim 25% share with 1 single nft", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await distributor.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [distributor, userB.signer],
        [utils.parseEther("-1.1"), utils.parseEther("1.1")]
      );
    });

    it("should claim new unclaimed amounts as new owner for 1 single nft", async function () {
      const { userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [distributor, userB.signer],
        [utils.parseEther("-1.1"), utils.parseEther("1.1")]
      );

      await userB.TestERC721.transferFrom(
        userB.signer.address,
        userC.signer.address,
        2
      );

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("2.4"),
      });

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await expect(
        await distributor
          .connect(userC.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [distributor, userC.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
    });

    it("should claim unclaimed amounts when amount of shares is updated", async function () {
      const { deployer, userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [distributor, userB.signer],
        [utils.parseEther("-1.1"), utils.parseEther("1.1")]
      );

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("2.4"),
      });

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await distributor.connect(deployer.signer).setShares([2, 4], [5000, 0]);

      await expect(
        await distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [distributor, userB.signer],
        [utils.parseEther("-2.3"), utils.parseEther("2.3")]
      );
    });

    it("should fail to claim for empty stream", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await expect(
        distributor.connect(userB.signer)["claim(uint256)"](2)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");

      await expect(
        distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");
    });

    it("should fail to claim when already claimed", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [distributor, userB.signer],
        [utils.parseEther("-1.1"), utils.parseEther("1.1")]
      );

      await expect(
        distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");
    });

    it("should fail to claim when not nft owner", async function () {
      const { userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.signer.sendTransaction({
        to: distributor.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        distributor.connect(userC.signer)["claim(uint256)"](2)
      ).to.be.revertedWith("DISTRIBUTOR/NOT_NFT_OWNER");
    });
  });

  describe("ERC20-based Streams", function () {
    it("should top-up a erc20-based stream", async function () {
      const { userA } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );

      expect(
        await distributor["streamTotalSupply(address)"](userA.TestERC20.address)
      ).to.equal(utils.parseEther("44"));
    });

    it("should top-up multiple times", async function () {
      const { userA } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("7")
      );
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("8")
      );

      expect(
        await distributor["streamTotalSupply(address)"](userA.TestERC20.address)
      ).to.equal(utils.parseEther("15"));
    });

    it("should claim 25% share with 1 single nft", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("11")
      );
    });

    it("should claim new unclaimed amounts as new owner for 1 single nft", async function () {
      const { userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("11")
      );

      await userB.TestERC721.transferFrom(
        userB.signer.address,
        userC.signer.address,
        2
      );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("24"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("24")
      );

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await distributor
        .connect(userC.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userC.TestERC20.balanceOf(userC.signer.address)).to.equal(
        utils.parseEther("6")
      );
    });

    it("should claim unclaimed amounts when amount of shares is updated", async function () {
      const { deployer, userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("11")
      );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("24"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("24")
      );

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await distributor.connect(deployer.signer).setShares([2, 4], [5000, 0]);

      await distributor
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("34")
      );
    });

    it("should fail to claim for empty stream", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await expect(
        distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");
    });

    it("should fail to claim when already claimed", async function () {
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("11")
      );

      await expect(
        distributor
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");
    });

    it("should fail to claim when not nft owner", async function () {
      const { userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("44")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        distributor
          .connect(userC.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("DISTRIBUTOR/NOT_NFT_OWNER");
    });
  });
});
