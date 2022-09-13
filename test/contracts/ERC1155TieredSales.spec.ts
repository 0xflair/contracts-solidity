import hre from "hardhat";
import { expect } from "chai";
import { utils } from "ethers";

import { setupTest } from "../setup";
import {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} from "../utils/common";
import {
  generateAllowlistLeaf,
  generateAllowlistMerkleTree,
} from "../utils/allowlists";
import { deployDiamond } from "../utils/diamond";
import { ERC1155TieredSales, ERC165 } from "../../typechain";
import { Tier } from "../utils/tiered-sales";
import { ERC1155Base } from "../../typechain/ERC1155Base";

const DEFAULT_TIERS: Tier[] = [
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
    end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60, // +10 days
    price: utils.parseEther("0.2"),
    currency: ZERO_ADDRESS,
    maxPerWallet: 5,
    merkleRoot: ZERO_BYTES32,
    reserved: 0,
    maxAllocation: 5000,
  },
];

const deployERC1155WithSales = async ({
  tiers = DEFAULT_TIERS,
}: {
  tiers?: Tier[];
} = {}) => {
  return await deployDiamond({
    facets: [
      // Base
      "ERC1155",
      // Features
      "ERC1155TieredSales",
      // Administration
      "ERC165Ownable",
      "ERC1155SupplyOwnable",
      "TieredSalesOwnable",
    ],
    initializations: [
      {
        facet: "ERC165Ownable",
        function: "setERC165",
        args: [["0xd9b67a26"], []],
      },
      {
        facet: "ERC1155SupplyOwnable",
        function: "setMaxSupply",
        args: [0, 1000],
      },
      {
        facet: "ERC1155SupplyOwnable",
        function: "setMaxSupply",
        args: [1, 1000],
      },
      {
        facet: "TieredSalesOwnable",
        function:
          "configureTiering(uint256[],(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256)[])",
        args: [Object.keys(tiers), Object.values(tiers)],
      },
      {
        facet: "ERC1155TieredSalesOwnable",
        function:
          "configureTierTokenId(uint256[],uint256[])",
        args: [Object.keys(tiers), Object.keys(tiers)], // Use tier index as token id
      },
    ],
  });
};

describe("ERC1155 Tiered Sales", function () {
  it("should return true when checking interfaces", async function () {
    await setupTest();

    const diamond = await deployERC1155WithSales();

    const erc165Facet = await hre.ethers.getContractAt<ERC165>(
      "contracts/features/introspection/ERC165.sol:ERC165",
      diamond.address
    );

    // ERC1155
    expect(await erc165Facet.supportsInterface("0xd9b67a26")).to.be.equal(true);
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

    const diamond = await deployERC1155WithSales({
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

    const erc1155Facet = await hre.ethers.getContractAt<ERC1155Base>(
      "ERC1155Base",
      diamond.address
    );
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>(
      "ERC1155TieredSales",
      diamond.address
    );

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
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

    await tieredSalesFacet.connect(userA.signer).mintByTier(
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

    await tieredSalesFacet.connect(userA.signer).mintByTier(
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
      tieredSalesFacet.connect(userA.signer).mintByTier(
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

    expect(await erc1155Facet.balanceOf(userA.signer.address, 0)).to.equal(3);
  });
});
