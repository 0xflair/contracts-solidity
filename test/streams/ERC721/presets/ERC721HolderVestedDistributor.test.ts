import { expect } from "chai";
import { utils, BigNumberish } from "ethers";

import { ERC721HolderVestedDistributor } from "../../../../typechain";
import { deployPermanentContract } from "../../../../hardhat.util";

import { setupTest } from "../../../setup";
import { increaseTime } from "../../../utils/common";
import { deployments, getUnnamedAccounts } from "hardhat";

const deployDistributor = async function (args: {
  claimToken?: string;
  ticketToken?: string;
  emissionRate?: BigNumberish;
  claimWindowUnit?: BigNumberish;
  claimStart?: BigNumberish;
  claimEnd?: BigNumberish;
}): Promise<ERC721HolderVestedDistributor> {
  const accounts = await getUnnamedAccounts();

  return (await deployPermanentContract(
    deployments,
    accounts[0],
    accounts[0],
    "ERC721HolderVestedDistributor",
    [
      {
        claimToken: "0x0000000000000000000000000000000000000000",
        ticketToken: "0x0000000000000000000000000000000000000000",
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 60 * 60, // 1 hour
        claimStart: 0,
        claimEnd: Infinity,
        ...args,
      },
    ]
  )) as ERC721HolderVestedDistributor;
};

describe("ERC721HolderVestedDistributor", function () {
  // describe("Release Amount Calculation", function () {
  //   it("should calculate release amount correctly based on unit window", async function () {
  //     const nowUnix = Math.floor(new Date().getTime() / 1000);
  //     const { userA } = await setupTest();
  //     const contract = userA.ERC721HolderVestedDistributor as ERC721HolderVestedDistributor;

  //     await contract.registerStream(
  //       userA.TestERC20.address,
  //       userA.TestERC721.address,
  //       utils.parseEther("1"),
  //       24 * 60 * 60,
  //       nowUnix,
  //       nowUnix + 30 * 24 * 60 * 60 // +30 days
  //     );

  //     const result = await contract.calculateReleasedAmountRounded(
  //       1,
  //       nowUnix + 5 * 24 * 60 * 60 // +5 days
  //     );

  //     expect(result.toString()).to.equal(utils.parseEther("5"));
  //   });

  //   it("should round down release amount correctly based on unit window", async function () {
  //     const nowUnix = Math.floor(new Date().getTime() / 1000);
  //     const { userA } = await setupTest();
  //     const contract = userA.ERC721HolderVestedDistributor as ERC721HolderVestedDistributor;

  //     await contract.registerStream(
  //       userA.TestERC20.address,
  //       userA.TestERC721.address,
  //       utils.parseEther("1"),
  //       24 * 60 * 60,
  //       nowUnix,
  //       nowUnix + 30 * 24 * 60 * 60 // +30 days
  //     );

  //     const result = await contract.calculateReleasedAmountRounded(
  //       1,
  //       nowUnix + Math.floor(6.5 * 24 * 60 * 60) // +6.5 days
  //     );

  //     expect(result.toString()).to.equal(utils.parseEther("6"));
  //   });

  //   it("should calculate factional release amount correctly based on unit window", async function () {
  //     const nowUnix = Math.floor(new Date().getTime() / 1000);
  //     const { userA } = await setupTest();
  //     const contract = userA.ERC721HolderVestedDistributor as ERC721HolderVestedDistributor;

  //     await contract.registerStream(
  //       userA.TestERC20.address,
  //       userA.TestERC721.address,
  //       utils.parseEther("1"),
  //       24 * 60 * 60,
  //       nowUnix,
  //       nowUnix + 30 * 24 * 60 * 60 // +30 days
  //     );

  //     const result = await contract.calculateReleasedAmountFractioned(
  //       1,
  //       nowUnix + Math.floor(6.5 * 24 * 60 * 60) // +6.5 days
  //     );

  //     expect(result.toString()).to.equal(utils.parseEther("6.5"));
  //   });
  // });

  // describe("Ether-based Streams", function () {
  //   it("should register ether-based streams", async function () {
  //     const nowUnix = Math.floor(new Date().getTime() / 1000);
  //     const { userA } = await setupTest();
  //     const contract = userA.ERC721HolderVestedDistributor as ERC721HolderVestedDistributor;

  //     await contract.registerStream(
  //       ZERO_ADDRESS,
  //       userA.TestERC721.address,
  //       utils.parseEther("1"),
  //       24 * 60 * 60,
  //       nowUnix,
  //       nowUnix + 30 * 24 * 60 * 60 // +30 days
  //     );

  //     const result = await contract.streams(1);

  //     expect(result.creator).to.equal(userA.signer.address);
  //     expect(result.claimToken).to.equal(ZERO_ADDRESS);
  //     expect(result.ticketToken).to.equal(userA.TestERC721.address);
  //     expect(result.emissionRate).to.equal(utils.parseEther("1"));
  //     expect(result.claimWindowUnit).to.equal(BigNumber.from(24 * 60 * 60));
  //     expect(result.claimStart).to.equal(BigNumber.from(nowUnix));
  //     expect(result.claimEnd).to.equal(
  //       BigNumber.from(nowUnix + 30 * 24 * 60 * 60)
  //     );
  //   });

  //   it("should top-up a ether-based stream", async function () {
  //     const nowUnix = Math.floor(new Date().getTime() / 1000);
  //     const { userA } = await setupTest();
  //     const contract = userA.ERC721HolderVestedDistributor as ERC721HolderVestedDistributor;

  //     await contract.registerStream(
  //       ZERO_ADDRESS,
  //       userA.TestERC721.address,
  //       utils.parseEther("1"),
  //       24 * 60 * 60,
  //       nowUnix,
  //       nowUnix + 30 * 24 * 60 * 60 // +30 days
  //     );

  //     await contract.topUp(1, utils.parseEther("15"), {
  //       value: utils.parseEther("15"),
  //     });

  //     expect(await contract.streamSupply(1)).to.equal(utils.parseEther("15"));
  //   });
  // });

  describe("ERC20-based Streams", function () {
    it("should top-up a erc20-based stream", async function () {
      const nowUnix = Math.floor(new Date().getTime() / 1000);
      const { userA } = await setupTest();

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("15")
      );

      expect(await distributor.streamTotalSupply()).to.equal(
        utils.parseEther("15")
      );
    });

    it("should top-up multiple times", async function () {
      const nowUnix = Math.floor(new Date().getTime() / 1000);
      const { userA } = await setupTest();

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("7")
      );
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("8")
      );

      expect(await distributor.streamTotalSupply()).to.equal(
        utils.parseEther("15")
      );
    });

    it("should partially claim 1 single nft", async function () {
      const nowUnix = Math.floor(new Date().getTime() / 1000);
      const { userA, userB } = await setupTest();

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("15")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor.connect(userB.signer).claim(1234);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("2")
      );
    });

    it("should claim remainder of unclaimed amount as new owner for 1 single nft", async function () {
      const nowUnix = Math.floor(new Date().getTime() / 1000);
      const { userA, userB, userC } = await setupTest();

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("15")
      );
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      await increaseTime(2 * 24 * 60 * 60); // 2 days

      await distributor.connect(userB.signer).claim(1234);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("2")
      );

      await userB.TestERC721.transferFrom(
        userB.signer.address,
        userC.signer.address,
        1234
      );

      await increaseTime(3 * 24 * 60 * 60); // 3 days

      await distributor.connect(userC.signer).claim(1234);

      expect(await userC.TestERC20.balanceOf(userC.signer.address)).to.equal(
        utils.parseEther("3")
      );
    });

    it("should fail to claim for non-started stream", async function () {
      const { userA } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix + 5 * 24 * 60 * 60, // +5 days
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await expect(
        distributor.connect(userA.signer).claim(1234)
      ).to.be.revertedWith("DISTRIBUTOR/NOT_STARTED");
    });

    it("should fail to claim for empty stream", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix - 5 * 24 * 60 * 60, // -5 days
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      await expect(
        distributor.connect(userB.signer).claim(1234)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should fail to claim when nothing to release on very first window", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      // Deploy
      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      // Top-up
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("15")
      );

      // Mint NFT
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      // Wait
      await increaseTime(0.5 * 24 * 60 * 60); // 0.5 day

      await expect(
        distributor.connect(userB.signer).claim(1234)
      ).to.be.revertedWith("DISTRIBUTOR/NOTHING_TO_CLAIM");
    });

    it("should fail to claim when too early according to window unit", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      // Deploy
      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      // Top-up
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("15"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("15")
      );

      // Mint NFT
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      // Wait
      await increaseTime(1 * 24 * 60 * 60); // 1 day

      // Claim
      await distributor.connect(userB.signer).claim(1234);

      // Wait
      await increaseTime(0.5 * 24 * 60 * 60); // 0.5 day

      await expect(
        distributor.connect(userB.signer).claim(1234)
      ).to.be.revertedWith("DISTRIBUTOR/TOO_EARLY");
    });

    it("should fail to claim when stream is depleted", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      // Deploy
      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 8 * 24 * 60 * 60, // +8 days
      });

      // Top-up
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("6"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("6")
      );

      // Mint NFT
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      // Wait & Claim
      await increaseTime(3 * 24 * 60 * 60); // 3 days
      await distributor.connect(userB.signer).claim(1234);
      await increaseTime(2 * 24 * 60 * 60); // 2 days
      await distributor.connect(userB.signer).claim(1234);

      // Wait
      await increaseTime(4 * 24 * 60 * 60); // 4 days

      await expect(
        distributor.connect(userB.signer).claim(1234)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should claim when stream is ended even if claimed long after end time", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      // Deploy
      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("1"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      // Top-up
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("6"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("6")
      );

      // Mint NFT
      await userA.TestERC721.mintExact(userB.signer.address, 1234);

      // Wait & Claim
      await increaseTime(3 * 24 * 60 * 60); // 3 day
      await distributor.connect(userB.signer).claim(1234);
      await increaseTime(2 * 24 * 60 * 60); // 2 day
      await distributor.connect(userB.signer).claim(1234);

      // Wait
      await increaseTime(88 * 24 * 60 * 60); // 88 day

      // Claim
      await distributor.connect(userB.signer).claim(1234);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("6")
      );
    });

    it("should claim in bulk when stream is ended even if claimed long after end time", async function () {
      const { userA, userB } = await setupTest();
      const nowUnix = Math.floor(new Date().getTime() / 1000);

      // Deploy
      const distributor = await deployDistributor({
        claimToken: userA.TestERC20.address,
        ticketToken: userA.TestERC721.address,
        emissionRate: utils.parseEther("2"),
        claimWindowUnit: 24 * 60 * 60, // daily
        claimStart: nowUnix,
        claimEnd: nowUnix + 6 * 24 * 60 * 60, // +6 days
      });

      // Top-up
      await userA.TestERC20.mint(userA.signer.address, utils.parseEther("24"));
      await userA.TestERC20.transfer(
        distributor.address,
        utils.parseEther("24")
      );

      // Mint NFT
      await userA.TestERC721.mintExact(userB.signer.address, 1234);
      await userA.TestERC721.mintExact(userB.signer.address, 5678);

      // Wait & Claim
      await increaseTime(3 * 24 * 60 * 60); // 3 day
      await distributor.connect(userB.signer).claimBulk([1234, 5678]);
      await increaseTime(2 * 24 * 60 * 60); // 2 day
      await distributor.connect(userB.signer).claimBulk([1234, 5678]);

      // Wait
      await increaseTime(8 * 24 * 60 * 60); // 8 day

      // Claim
      await distributor.connect(userB.signer).claimBulk([1234, 5678]);

      expect(await userB.TestERC20.balanceOf(userB.signer.address)).to.equal(
        utils.parseEther("24")
      );
    });
  });
});
