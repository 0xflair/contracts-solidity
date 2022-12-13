import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

import { expect } from 'chai';
import { utils } from 'ethers';
import hre from 'hardhat';

import {
  DiamondLoupe,
  ERC165,
  ERC721SupplyOwnable,
  ERC721TieredSales,
  IERC721,
  IERC721SupplyExtension,
  TieredSalesOwnable,
} from '../../src/typechain';
import { ERC721MintableOwnable } from '../../src/typechain/ERC721MintableOwnable';
import { setupTest } from '../setup';
import { generateAllowlistLeaf, generateAllowlistMerkleTree } from '../utils/allowlists';
import { ZERO_ADDRESS, ZERO_BYTES32 } from '../utils/common';
import { deployDiamond, Initialization } from '../utils/diamond';
import { Tier } from '../utils/tiered-sales';

const DEFAULT_TIERS: Tier[] = [
  {
    start: 0,
    end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60, // +10 days
    price: utils.parseEther('0.06'),
    currency: ZERO_ADDRESS,
    maxPerWallet: 5,
    merkleRoot: ZERO_BYTES32,
    reserved: 0,
    maxAllocation: 5000,
  },
  {
    start: 0,
    end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60, // +10 days
    price: utils.parseEther('0.2'),
    currency: ZERO_ADDRESS,
    maxPerWallet: 5,
    merkleRoot: ZERO_BYTES32,
    reserved: 0,
    maxAllocation: 5000,
  },
];

const deployERC721WithSales = async ({
  tiers = DEFAULT_TIERS,
  initializations = [],
}: {
  tiers?: Tier[];
  initializations?: Initialization[];
} = {}) => {
  return deployDiamond({
    facets: [
      // Base
      'ERC721A',
      // Features
      'ERC721TieredSales',
      // Administration
      'ERC165Ownable',
      'ERC721SupplyOwnable',
      'TieredSalesOwnable',
      'ERC721MintableOwnable',
    ],
    initializations: [
      {
        facet: 'ERC165Ownable',
        function: 'setERC165',
        args: [['0xd9b67a26', '0x744f4bd4'], []],
      },
      {
        facet: 'ERC721SupplyOwnable',
        function: 'setMaxSupply',
        args: [8000],
      },
      {
        facet: 'TieredSalesOwnable',
        function: 'configureTiering(uint256[],(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256)[])',
        args: [Object.keys(tiers), Object.values(tiers)],
      },
      ...initializations,
    ],
  });
};

describe('ERC721 Tiered Sales for Gas Estimation', function () {
  it('should mint by tier multiple times until reached max allowance in allowlist', async function () {
    const TOTAL_MINT = 100;

    const { userA } = await setupTest();

    const mkt = generateAllowlistMerkleTree([
      {
        address: userA.signer.address,
        maxAllowance: TOTAL_MINT,
      },
    ]);

    const diamond = await deployERC721WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: TOTAL_MINT,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.1'),
          reserved: 0,
          maxAllocation: TOTAL_MINT,
        },
      ],
    });

    const erc721Facet = await hre.ethers.getContractAt<IERC721>('IERC721', diamond.address);
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC721TieredSales>('ERC721TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      TOTAL_MINT,
      TOTAL_MINT,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther((0.1 * TOTAL_MINT).toString()),
      },
    );

    expect(await erc721Facet.balanceOf(userA.signer.address)).to.equal(TOTAL_MINT);
  });
});
