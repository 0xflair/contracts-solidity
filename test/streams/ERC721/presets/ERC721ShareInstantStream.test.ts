import { expect } from "chai";
import { utils, BigNumberish } from "ethers";
import hre, { deployments, getUnnamedAccounts } from "hardhat";

import { ERC721ShareInstantStream } from "../../../../typechain";
import { deployPermanentContract } from "../../../../hardhat.util";

import { setupTest } from "../../../setup";
import { increaseTime, ZERO_ADDRESS } from "../../../utils/common";

const deployStream = async function (args?: {
  ticketToken?: string;
  tokenIds?: BigNumberish[];
  shares?: BigNumberish[];
  lockedUntilTimestamp?: BigNumberish;
}): Promise<ERC721ShareInstantStream> {
  const accounts = await getUnnamedAccounts();
  const nowMinusOneDayUnix =
    Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60;
  const ticketToken = await hre.ethers.getContract("TestERC721", accounts[0]);

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721ShareInstantStream",
    [
      {
        // Base
        ticketToken: ticketToken.address,
        lockedUntilTimestamp: nowMinusOneDayUnix,
        // Share split extension
        tokenIds: [1, 2, 3, 4],
        shares: [2500, 1000, 2500, 4000],
        // Lockable claim extension
        claimLockedUntil: 0,
        ...(args || {}),
      },
    ]
  )) as ERC721ShareInstantStream;
};

describe("ERC721ShareInstantStream", function () {
  describe("Interfaces", function () {
    it("supports IERC721ShareSplitExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0x678f467e")).to.equal(true);
    });

    it("supports IERC721InstantReleaseExtension", async function () {
      await setupTest();
      const stream = await deployStream();

      expect(await stream.supportsInterface("0x12599909")).to.equal(true);
    });
  });

  describe("Factory", function () {
    it("should create stream using factory", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();
      const salt = utils.randomBytes(32);
      const data = stream.interface.encodeFunctionData("initialize", [
        {
          ticketToken: userA.TestERC721.address,
          lockedUntilTimestamp: 0,
          tokenIds: [1, 2, 3, 4],
          shares: [2500, 1000, 2500, 4000],
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
        "ERC721ShareInstantStream",
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

    it("should claim 10% share with 1 single nft", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.44"), utils.parseEther("0.44")]
      );
    });

    it("should claim new unclaimed amounts as new owner for 1 single nft", async function () {
      const { userA, userB, userC } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.44"), utils.parseEther("0.44")]
      );

      await userB.TestERC721.transferFrom(
        userB.signer.address,
        userC.signer.address,
        2
      );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("2.4"),
      });

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await expect(
        await stream
          .connect(userC.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [stream, userC.signer],
        [utils.parseEther("-0.24"), utils.parseEther("0.24")]
      );
    });

    it("should claim unclaimed amounts when amount of shares is updated", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.44"), utils.parseEther("0.44")]
      );

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("2.4"),
      });

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await stream
        .connect(deployer.signer)
        .setSharesForTokens([2, 4], [5000, 0]);

      await expect(
        await stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-2.96"), utils.parseEther("2.96")]
      );
    });

    it("should fail to claim for empty stream", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await expect(
        stream.connect(userB.signer)["claim(uint256)"](2)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");

      await expect(
        stream.connect(userB.signer)["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should fail to claim when already claimed", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.44"), utils.parseEther("0.44")]
      );

      await expect(
        stream.connect(userB.signer)["claim(uint256,address)"](2, ZERO_ADDRESS)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should claim on behalf of current nft owner", async function () {
      const { userA, userB, userC } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await expect(
        await stream
          .connect(userC.signer)
          ["claim(uint256[],address,address)"](
            [2],
            ZERO_ADDRESS,
            userB.signer.address
          )
      ).to.changeEtherBalances(
        [stream, userB.signer],
        [utils.parseEther("-0.44"), utils.parseEther("0.44")]
      );
    });
  });

  describe("ERC20-based Streams", function () {
    it("should top-up a erc20-based stream", async function () {
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

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("7"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("8"));

      expect(
        await stream["streamTotalSupply(address)"](userA.TestERC20.address)
      ).to.equal(utils.parseEther("15"));
    });

    it("should claim 10% share with 1 single nft", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await stream
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("4.4")
      );
    });

    it("should claim new unclaimed amounts as new owner for 1 single nft", async function () {
      const { userA, userB, userC } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await stream
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("4.4")
      );

      await userB.TestERC721.transferFrom(
        userB.signer.address,
        userC.signer.address,
        2
      );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("24"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("24"));

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await stream
        .connect(userC.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userC.TestERC20.balanceOf(userC.signer.address)).to.equal(
        utils.parseEther("2.4")
      );
    });

    it("should claim unclaimed amounts when amount of shares is updated", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await stream
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("4.4")
      );

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("24"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("24"));

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await stream
        .connect(deployer.signer)
        .setSharesForTokens([2, 4], [5000, 0]);

      await stream
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("34")
      );
    });

    it("should fail to claim for empty stream", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should fail to claim when already claimed", async function () {
      const { userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await stream
        .connect(userB.signer)
        ["claim(uint256,address)"](2, userA.TestERC20.address);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("4.4")
      );

      await expect(
        stream
          .connect(userB.signer)
          ["claim(uint256,address)"](2, userA.TestERC20.address)
      ).to.be.revertedWith("NOTHING_TO_CLAIM");
    });

    it("should claim on behalf of current nft owner", async function () {
      const { userA, userB, userC } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));
      await userA.TestERC721.mintExact(userB.signer.address, 2);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await stream
        .connect(userC.signer)
        ["claim(uint256[],address,address)"](
          [2],
          userA.TestERC20.address,
          userB.signer.address
        );

      expect(await userC.TestERC20.balanceOf(userC.signer.address)).to.equal(
        utils.parseEther("0")
      );
      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("4.4")
      );
    });
  });

  describe("Withdraw Extension", function () {
    it("should set the withdraw recipient correctly", async function () {
      const { deployer, userA } = await setupTest();

      const stream = await deployStream();

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userA.signer.address);

      expect(await stream.withdrawRecipient()).to.equal(userA.signer.address);
    });

    it("should lock the withdraw recipient correctly so no new recipient can be set", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userA.signer.address);

      await stream.connect(deployer.signer).lockWithdrawRecipient();

      expect(await stream.withdrawRecipientLocked()).to.equal(true);

      await expect(
        stream
          .connect(deployer.signer)
          .setWithdrawRecipient(userB.signer.address)
      ).to.be.revertedWith("LOCKED");
    });

    it("should withdraw all the funds to the recipient", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userB.signer.address);

      await expect(
        await stream
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("4.4")])
      ).to.changeEtherBalances([userB.signer], [utils.parseEther("4.4")]);
    });

    it("should withdraw a portion of funds to the recipient", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.signer.sendTransaction({
        to: stream.address,
        value: utils.parseEther("4.4"),
      });

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userB.signer.address);

      await expect(
        await stream
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0.4")])
      ).to.changeEtherBalances([userB.signer], [utils.parseEther("0.4")]);
    });

    it("should not allow to withdraw with another address that does not have ownership access", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userB.signer.address);

      await expect(
        stream
          .connect(userB.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0")])
      ).to.be.revertedWith("WITHDRAW/ONLY_OWNER");
    });

    it("should not allow to withdraw when emergency withdraw power is revoked", async function () {
      const { deployer, userA, userB } = await setupTest();

      const stream = await deployStream();

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("44"));
      await userA.TestERC20.transfer(stream.address, utils.parseEther("44"));

      await stream
        .connect(deployer.signer)
        .setWithdrawRecipient(userB.signer.address);

      await stream.connect(deployer.signer).revokeWithdrawPower();

      expect(await stream.withdrawPowerRevoked()).to.equal(true);

      await expect(
        stream
          .connect(deployer.signer)
          .withdraw([ZERO_ADDRESS], [utils.parseEther("0")])
      ).to.be.revertedWith("WITHDRAW/EMERGENCY_POWER_REVOKED");
    });
  });
});
