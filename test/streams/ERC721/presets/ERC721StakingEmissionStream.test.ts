import { expect } from "chai";
import { utils, BigNumberish } from "ethers";
import hre, { deployments, getUnnamedAccounts } from "hardhat";

import { ERC721StakingEmissionStream } from "../../../../typechain";
import { deployPermanentContract } from "../../../../hardhat.util";

import { setupTest } from "../../../setup";
import { increaseTime, ZERO_ADDRESS } from "../../../utils/common";
import { deployCollection } from "../../../collections/presets/ERC721FullFeaturedCollection.test";

const deployStream = async function (args?: {
  ticketToken?: string;
  lockedUntilTimestamp?: BigNumberish;
  minStakingLockTime?: BigNumberish;
}): Promise<ERC721StakingEmissionStream> {
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
    "ERC721StakingEmissionStream",
    [
      {
        // Base
        ticketToken: ticketToken.address,
        lockedUntilTimestamp: nowMinusOneDayUnix,
        // Locked staking extension
        minStakingLockTime: 3600, // 1 hour
        // Emission release extension
        emissionRate: utils.parseEther("2"),
        emissionTimeUnit: 3600, // 1 hour
        emissionStart: nowMinusOneDayUnix,
        emissionEnd: nowPlusFiveDaysUnix,
        // Lockable claim extension
        claimLockedUntil: 0,

        ...(args || {}),
      },
    ]
  )) as ERC721StakingEmissionStream;
};

describe("ERC721StakingEmissionStream", function () {
  describe("Interfaces", function () {
    it("supports IERC721LockedStakingExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0x7f4fdea8")).to.equal(true);
    });

    it("supports IERC721EmissionReleaseExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0x4d0b5a49")).to.equal(true);
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
          // Staking claim extension
          minStakingLockTime: 3600, // 1 hour
          // Emission release extension
          emissionRate: utils.parseEther("2"),
          emissionTimeUnit: 3600, // 1 hour
          emissionStart: 0,
          emissionEnd: Math.floor(+new Date() / 1000 + 100000000),
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
        "ERC721StakingEmissionStream",
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

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
        minStakingLockTime: 20 * 3600, // 20 hours
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userB.signer)["unstake(uint256)"](2)
      ).to.be.revertedWith("STREAM/NOT_LOCKED_ENOUGH");

      expect(
        await lockableCollection.connect(userB.signer).locked(2)
      ).to.be.equal(true);

      await increaseTime(30 * 60 * 60); // 30 hours

      await stream.connect(userB.signer)["unstake(uint256)"](2);

      expect(
        await lockableCollection.connect(userB.signer).locked(2)
      ).to.be.equal(false);
    });

    it("should fail to unstake sooner than min lock time", async function () {
      const { deployer, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
        minStakingLockTime: 20 * 3600, // 20 hours
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userB.signer)["unstake(uint256)"](2)
      ).to.be.revertedWith("STREAM/NOT_LOCKED_ENOUGH");

      expect(
        await lockableCollection.connect(userB.signer).locked(2)
      ).to.be.equal(true);

      await increaseTime(30 * 60 * 60); // 30 hours

      await stream.connect(userB.signer)["unstake(uint256)"](2);

      expect(
        await lockableCollection.connect(userB.signer).locked(2)
      ).to.be.equal(false);
    });

    it("should fail to unstake on behalf of current nft owner", async function () {
      const { deployer, userB, userC } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        stream.connect(userC.signer)["unstake(uint256)"](2)
      ).to.be.revertedWith("STREAM/NOT_TOKEN_OWNER");
    });

    it("should fail to stake on behalf of current nft owner", async function () {
      const { deployer, userB, userC } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await expect(
        stream.connect(userC.signer)["stake(uint256)"](2)
      ).to.be.revertedWith("STREAM/NOT_TOKEN_OWNER");
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

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(utils.parseEther("6"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );
    });

    it("should claim only for duration of emission not longer", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("200"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(15 * 24 * 60 * 60); // 15 days

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(utils.parseEther("190"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-190"), utils.parseEther("190")]
      );
    });

    it("should not claim for un-staked nfts", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(0);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);

      await expect(
        stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.be.revertedWith("STREAM/NOTHING_TO_CLAIM");
    });

    it("should not claim when already claimed recently", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );

      await expect(
        stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.be.revertedWith("STREAM/TOO_EARLY");
    });

    it("should stake and claim multiple times for a single nft", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(utils.parseEther("6"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );

      await stream.connect(userB.signer)["unstake(uint256)"](2);
      const prevTotalDuration = await stream
        .connect(userB.signer)
        ["totalStakedDuration(uint256)"](2);

      await increaseTime(10 * 60 * 60); // 10 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(prevTotalDuration);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(4 * 60 * 60); // 4 hours

      expect(
        await stream.connect(userB.signer)["streamClaimableAmount(uint256)"](2)
      ).to.be.equal(utils.parseEther("8"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(prevTotalDuration);

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-8"), utils.parseEther("8")]
      );
    });

    it("should claim on behalf of current nft owner", async function () {
      const { deployer, userA, userB, userC } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("20"),
      });

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(async () =>
        stream.connect(userC.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
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

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("6"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );
    });

    it("should claim only for duration of emission not longer", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("200"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("200"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(15 * 24 * 60 * 60); // 15 days

      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("190"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-190"), utils.parseEther("190")]
      );
    });

    it("should not claim for un-staked nfts", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(0);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);

      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("STREAM/NOTHING_TO_CLAIM");
    });

    it("should not claim when already claimed recently", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );

      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("STREAM/TOO_EARLY");
    });

    it("should stake and claim multiple times for a single nft", async function () {
      const { deployer, userA, userB } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(0);
      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(0);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("6"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(10000);

      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );

      await stream.connect(userB.signer)["unstake(uint256)"](2);
      const prevTotalDuration = await stream
        .connect(userB.signer)
        ["totalStakedDuration(uint256)"](2);

      await increaseTime(10 * 60 * 60); // 10 hours

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.equal(prevTotalDuration);

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(4 * 60 * 60); // 4 hours

      expect(
        await stream
          .connect(userB.signer)
          ["streamClaimableAmount(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.equal(utils.parseEther("8"));

      expect(
        await stream.connect(userB.signer)["totalStakedDuration(uint256)"](2)
      ).to.be.gt(prevTotalDuration);

      await expect(async () =>
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-8"), utils.parseEther("8")]
      );
    });

    it("should claim on behalf of current nft owner", async function () {
      const { deployer, userA, userB, userC } = await setupTest();

      const lockableCollection = await deployCollection("normal");
      const stream = await deployStream({
        ticketToken: lockableCollection.address,
      });

      await lockableCollection
        .connect(deployer.signer)
        .grantRole(
          utils.keccak256(utils.toUtf8Bytes("LOCKER_ROLE")),
          stream.address
        );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("20"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("20"));

      await lockableCollection
        .connect(deployer.signer)
        .mintByOwner(userB.signer.address, 5);

      await increaseTime(1 * 24 * 60 * 60); // 1 day

      await stream.connect(userB.signer)["stake(uint256)"](2);

      await increaseTime(3 * 60 * 60); // 3 hours

      await expect(async () =>
        stream
          .connect(userC.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.changeTokenBalances(
        userA.TestERC20,
        [stream, userB.signer],
        [utils.parseEther("-6"), utils.parseEther("6")]
      );
    });
  });
});
