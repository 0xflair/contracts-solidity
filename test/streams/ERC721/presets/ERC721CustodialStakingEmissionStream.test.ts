import { expect } from "chai";
import { utils, BigNumberish } from "ethers";
import hre, { deployments, getUnnamedAccounts, ethers } from "hardhat";

import {
  ERC721CustodialStakingEmissionStream,
  TestERC721,
  TestERC721__factory,
} from "../../../../typechain";
import { deployPermanentContract } from "../../../../hardhat.util";

import { setupTest } from "../../../setup";
import { increaseTime, ZERO_ADDRESS } from "../../../utils/common";

export const deployCollection = async function (): Promise<TestERC721> {
  const TestERC721 = await ethers.getContractFactory<TestERC721__factory>(
    "TestERC721"
  );

  return await TestERC721.deploy();
};

const deployStream = async function (args?: {
  ticketToken?: string;
  lockedUntilTimestamp?: BigNumberish;
  minStakingDuration?: BigNumberish;
  maxStakingTotalDurations?: BigNumberish;
  emissionStart?: BigNumberish;
  emissionEnd?: BigNumberish;
}): Promise<ERC721CustodialStakingEmissionStream> {
  const accounts = await getUnnamedAccounts();
  const nowMinusOneDayUnix =
    Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60;
  const nowPlusFiveDaysUnix =
    Math.floor(new Date().getTime() / 1000) + 5 * 24 * 60 * 60;
  const ticketToken = await hre.ethers.getContract("TestERC721", accounts[0]);

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721CustodialStakingEmissionStream",
    [
      {
        // Base
        ticketToken: ticketToken.address,
        lockedUntilTimestamp: nowMinusOneDayUnix,
        // Locked staking extension
        minStakingDuration: 3600, // 1 hour
        maxStakingTotalDurations: 300 * 3600, // 300 hours
        // Emission release extension
        emissionRate: utils.parseEther("2"),
        emissionTimeUnit: 3600, // 1 hour
        emissionStart: nowMinusOneDayUnix,
        emissionEnd: nowPlusFiveDaysUnix,
        // Equal split extension
        totalTickets: 10,
        // Lockable claim extension
        claimLockedUntil: 0,

        ...(args || {}),
      },
    ]
  )) as ERC721CustodialStakingEmissionStream;
};

describe("ERC721CustodialStakingEmissionStream", function () {
  describe("Interfaces", function () {
    it("supports IERC721CustodialStakingExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0x7ef569ae")).to.equal(true);
    });

    it("supports IERC721EmissionReleaseExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0xc9f600a9")).to.equal(true);
    });
  });

  describe("Factory", function () {
    it("should create stream using factory", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();
      const salt = utils.randomBytes(32);
      const data = stream.interface.encodeFunctionData("initialize", [
        {
          // Base
          ticketToken: userA.TestERC721.address,
          lockedUntilTimestamp: 0,
          // Locked staking extension
          minStakingDuration: 3600, // 1 hour
          maxStakingTotalDurations: 300 * 3600, // 300 hours
          // Emission release extension
          emissionRate: utils.parseEther("2"),
          emissionTimeUnit: 3600, // 1 hour
          emissionStart: 0,
          emissionEnd: Math.floor(+new Date() / 1000 + 100000000),
          // Equal split extension
          totalTickets: 1,
          // Lockable claim extension
          claimLockedUntil: 0,
        },
        userB.signer.address,
      ]);

      const predictedAddress =
        await userA.FlairFactory.predictDeterministicSimple(
          stream.address,
          salt
        );

      const result = await userA.FlairFactory.cloneDeterministicSimple(
        stream.address,
        salt,
        data
      );

      const receipt = await result.wait();
      const event = receipt?.events?.find((e) => e.event === "ProxyCreated");
      const emittedAddress = event?.args?.[1];

      expect(emittedAddress).to.equal(predictedAddress);

      const streamClone = await hre.ethers.getContractAt(
        "ERC721CustodialStakingEmissionStream",
        emittedAddress
      );

      await userA.signer.sendTransaction({
        to: streamClone.address,
        value: utils.parseEther("4.4"),
      });

      expect(await stream["streamTotalSupply()"]()).to.equal(
        utils.parseEther("0")
      );

      expect(await streamClone["streamTotalSupply()"]()).to.equal(
        utils.parseEther("4.4")
      );

      expect(await stream.owner()).to.equal(deployer.signer.address);
      expect(await streamClone["owner()"]()).to.equal(userB.signer.address);
    });
  });

  describe("Common", function () {
    it("should fail to claim when claiming is locked", async function () {
      const { deployer, userB } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 20 * 3600, // 20 hours
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);
      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userB.signer)["unstake(uint256)"](5)
      ).to.be.revertedWith("NOT_STAKED_LONG_ENOUGH");

      expect(await nftCollection.connect(userB.signer).ownerOf(5)).to.be.equal(
        stream.address
      );
      const tokensInCustodyForUser = (
        await stream
          .connect(userB.signer)
          .tokensInCustody(userB.signer.address, 0, 10000)
      ).reduce<BigNumberish[]>(
        (list, inCustody, tokenId) => (inCustody ? [...list, tokenId] : list),
        []
      );

      expect(tokensInCustodyForUser).to.deep.equal([5]);

      await increaseTime(30 * 60 * 60); // 30 hours

      await stream.connect(userB.signer)["unstake(uint256)"](5);

      expect(await nftCollection.connect(userB.signer).ownerOf(5)).to.be.equal(
        userB.signer.address
      );
    });

    it("should fail to unstake sooner than min lock time", async function () {
      const { deployer, userB } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 20 * 3600, // 20 hours
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userB.signer)["unstake(uint256)"](5)
      ).to.be.revertedWith("NOT_STAKED_LONG_ENOUGH");

      expect(await nftCollection.connect(userB.signer).ownerOf(5)).to.be.equal(
        stream.address
      );
      const tokensInCustodyForUserBefore = (
        await stream
          .connect(userB.signer)
          .tokensInCustody(userB.signer.address, 0, 10000)
      ).reduce<BigNumberish[]>(
        (list, inCustody, tokenId) => (inCustody ? [...list, tokenId] : list),
        []
      );
      expect(tokensInCustodyForUserBefore).to.deep.equal([5]);

      await increaseTime(30 * 60 * 60); // 30 hours

      await stream.connect(userB.signer)["unstake(uint256)"](5);

      expect(await nftCollection.connect(userB.signer).ownerOf(5)).to.be.equal(
        userB.signer.address
      );
      const tokensInCustodyForUserAfter = (
        await stream
          .connect(userB.signer)
          .tokensInCustody(userB.signer.address, 0, 10000)
      ).reduce<BigNumberish[]>(
        (list, inCustody, tokenId) => (inCustody ? [...list, tokenId] : list),
        []
      );
      expect(tokensInCustodyForUserAfter).to.deep.equal([]);
    });

    it("should fail to unstake on behalf of current nft owner", async function () {
      const { deployer, userB, userC } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userC.signer)["unstake(uint256)"](5)
      ).to.be.revertedWith("NOT_STAKER");
    });

    it("should fail to stake on behalf of current nft owner", async function () {
      const { deployer, userB, userC } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await expect(
        stream.connect(userC.signer)["stake(uint256)"](5)
      ).to.be.revertedWith("ERC721: transfer from incorrect owner");
    });

    it("should not count more than max staking durations", async function () {
      const { deployer, userA, userB } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 1 * 3600, // 1 hour
        maxStakingTotalDurations: 2 * 3600, // 2 hours
      });

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 6);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(17 * 60 * 60); // 17 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("0.4")); // only count 2 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(7200); // only count 2 hours

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        // 4 eth streamed to total of 10 tickets
        [utils.parseEther("-0.4"), utils.parseEther("0.4")]
      );
    });

    it("should fail to stake if already exceeds max staking", async function () {
      const { deployer, userA, userB } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 1 * 3600, // 1 hour
        maxStakingTotalDurations: 2 * 3600, // 2 hours
      });

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(17 * 60 * 60); // 17 hours

      await stream.connect(userB.signer)["unstake(uint256)"](5);

      await expect(
        stream.connect(userB.signer)["stake(uint256)"](5)
      ).to.be.revertedWith("MAX_DURATION_EXCEEDED");
    });

    it("should correctly calculate staked duration even if emission end is not set", async function () {
      const { deployer, userB } = await setupTest();

      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        emissionEnd: 0,
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("0.6"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(10_800);
    });
  });

  describe("Native Token Streams", function () {
    it("should top-up a native-token stream", async function () {
      const { userA } = await setupTest();
      const stream = await deployStream();
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });
      expect(await stream["streamTotalSupply()"]()).to.equal(
        utils.parseEther("4.4")
      );
      expect(await stream["streamTotalSupply(address)"](ZERO_ADDRESS)).to.equal(
        utils.parseEther("4.4")
      );
    });

    it("should top-up multiple times", async function () {
      const { userA } = await setupTest();
      const stream = await deployStream();
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("3.4"),
      });
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("1.1"),
      });
      expect(await stream["streamTotalSupply()"]()).to.equal(
        utils.parseEther("4.5")
      );
      expect(await stream["streamTotalSupply(address)"](ZERO_ADDRESS)).to.equal(
        utils.parseEther("4.5")
      );
    });

    it("should claim for 3 hours of staking with 1 single nft", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("0.6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);
      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
    });

    it("should claim only for duration of emission not longer", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 1 * 3600, // 1 hour
        maxStakingTotalDurations: 30 * 3600, // 30 hours
      });

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("200"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60 - 5); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(4 * 24 * 60 * 60 - 5); // 4 days

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(108_000);
      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );
    });

    it("should not claim for un-staked nfts", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      await expect(
        stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should not claim when already claimed recently", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
      await expect(
        stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.be.revertedWith("TOO_EARLY");
    });

    it("should stake and claim multiple times for a single nft", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(3 * 60 * 60); // 3 hours
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("0.6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);
      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );

      await stream.connect(userB.signer)["unstake(uint256)"](5);
      const prevTotalDuration = await stream
        .connect(userB.signer)
        ["totalStakedDuration(uint256)"](5);
      await increaseTime(10 * 60 * 60); // 10 hours
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(prevTotalDuration);

      await stream.connect(userB.signer)["stake(uint256)"](5);

      await increaseTime(4 * 60 * 60); // 4 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](5)
      ).to.be.equal(utils.parseEther("0.8"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(prevTotalDuration);

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](5)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.8"), utils.parseEther("0.8")]
      );
    });

    it("should claim on behalf of current nft owner", async function () {
      const { deployer, userA, userB, userC } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });
      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      await expect(async () =>
        stream
          .connect(userC.signer)
          ["claim(uint256[],address,address)"](
            [5],
            ZERO_ADDRESS,
            userB.signer.address
          )
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
    });
  });

  describe("ERC20-based Streams", function () {
    it("should top-up a erc20 stream", async function () {
      const { userA } = await setupTest();
      const stream = await deployStream();
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      expect(
        await stream["streamTotalSupply(address)"](userA.TestERC20.address)
      ).to.equal(utils.parseEther("44"));
    });

    it("should top-up multiple times", async function () {
      const { userA } = await setupTest();
      const stream = await deployStream();
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("11"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("11"));
      expect(
        await stream["streamTotalSupply(address)"](userA.TestERC20.address)
      ).to.equal(utils.parseEther("55"));
    });

    it("should claim for 3 hours of staking with 1 single nft", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("0.6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
    });

    it("should claim only for duration of emission not longer", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
        minStakingDuration: 1 * 3600, // 1 hour
        maxStakingTotalDurations: 30 * 3600, // 30 hours
      });

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("200"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("200"));

      await increaseTime(1 * 24 * 60 * 60 - 5); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(4 * 24 * 60 * 60 - 5); // 4 days
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(108_000);
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );
    });

    it("should not claim for un-staked nfts", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(0);
      await increaseTime(3 * 60 * 60); // 3 hours
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should not claim when already claimed recently", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.revertedWith("TOO_EARLY");
    });

    it("should stake and claim multiple times for a single nft", async function () {
      const { deployer, userA, userB } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(0);
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("0.6"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
      await stream.connect(userB.signer)["unstake(uint256)"](5);
      const prevTotalDuration = await stream
        .connect(userB.signer)
        ["totalStakedDuration(uint256)"](5);
      await increaseTime(10 * 60 * 60); // 10 hours
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(prevTotalDuration);
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(4 * 60 * 60); // 4 hours
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("0.8"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(prevTotalDuration);
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.8"), utils.parseEther("0.8")]
      );
    });

    it("should claim on behalf of current nft owner", async function () {
      const { deployer, userA, userB, userC } = await setupTest();
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(3 * 60 * 60); // 3 hours
      await expect(async () =>
        stream
          .connect(userC.signer)
          ["claim(uint256[],address,address)"](
            [5],
            userB.TestERC20.address,
            userB.signer.address
          )
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.6"), utils.parseEther("0.6")]
      );
    });

    it("should not claim anything more after unstaked", async function () {
      const { deployer, userA, userB } = await setupTest();

      // Contracts
      const nftCollection = await deployCollection();
      const stream = await deployStream({
        ticketToken: nftCollection.address,
      });

      // Top-up stream
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("200"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("200"));

      // Mint NFTs and approve stream
      await nftCollection
        .connect(deployer.signer)
        .mintExact(userB.signer.address, 5);
      await nftCollection
        .connect(userB.signer)
        .setApprovalForAll(stream.address, true);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      // Check initial values
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(0);

      // Stake an NFT
      await stream.connect(userB.signer)["stake(uint256)"](5);

      // Wait and then Unstake the NFT
      await increaseTime(5 * 60 * 60); // 5 hours
      await stream.connect(userB.signer)["unstake(uint256)"](5);

      // Check expected accounting
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("1"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);

      // Claim the rewards
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-1"), utils.parseEther("1")]
      );

      // Wait while un-staked
      await increaseTime(5 * 60 * 60); // 5 hours

      // Stake another 4 hours
      await stream.connect(userB.signer)["stake(uint256)"](5);
      await increaseTime(4 * 60 * 60); // 4 hours
      await stream.connect(userB.signer)["unstake(uint256)"](5);

      // Check expected accounting again for only 4 hours
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](5, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("0.8"));
      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](5)
      ).to.be.gt(10000);

      // Claim the second rewards
      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](5, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-0.8"), utils.parseEther("0.8")]
      );
    });
  });
});
