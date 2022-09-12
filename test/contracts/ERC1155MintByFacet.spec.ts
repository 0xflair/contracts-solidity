import hre from "hardhat";
import { expect } from "chai";

import { deployDiamond } from "../utils/diamond";
import { ERC1155MintByFacet, Multicall } from "../../typechain";
import { setupTest } from "../setup";

const deployERC1155 = async () => {
  return await deployDiamond({
    facets: ["ERC1155SupplyMintableLockableBurnable"],
    initializations: [
      {
        facet: "ERC1155SupplyOwnable",
        function: "setMaxSupply",
        args: [33, 1000],
      },
    ],
  });
};

describe("ERC1155MintByFacet", function () {
  it("should not be able to mint when external account calls", async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155();

    const mintFacet = await hre.ethers.getContractAt<ERC1155MintByFacet>(
      "ERC1155MintByFacet",
      diamond.address
    );

    await expect(
      mintFacet
        .connect(userA.signer)
        .mintByFacet(userA.signer.address, 33, 1, "0x")
    ).to.be.revertedWith("SenderIsNotSelf()");
  });

  it("should not be able to mint when calling via multicall", async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155();

    const multiCallContract = await hre.ethers.getContractAt<Multicall>(
      "Multicall",
      diamond.address
    );

    const mintFacet = await hre.ethers.getContractAt<ERC1155MintByFacet>(
      "ERC1155MintByFacet",
      diamond.address
    );

    const callData = mintFacet.interface.encodeFunctionData("mintByFacet", [
      userA.signer.address,
      33,
      1,
      "0x",
    ]);

    await expect(
      multiCallContract.connect(userA.signer).multicall([callData])
    ).to.be.revertedWith("SenderIsNotSelf()");
  });

  it("should not be able to mint when calling via nested multicall", async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155();

    const multiCallContract = await hre.ethers.getContractAt<Multicall>(
      "Multicall",
      diamond.address
    );

    const mintFacet = await hre.ethers.getContractAt<ERC1155MintByFacet>(
      "ERC1155MintByFacet",
      diamond.address
    );

    const callData = mintFacet.interface.encodeFunctionData("mintByFacet", [
      userA.signer.address,
      33,
      1,
      "0x",
    ]);

    const callDataNested = multiCallContract.interface.encodeFunctionData(
      "multicall",
      [[callData]]
    );

    await expect(
      multiCallContract.connect(userA.signer).multicall([callDataNested])
    ).to.be.revertedWith("SenderIsNotSelf()");
  });
});
