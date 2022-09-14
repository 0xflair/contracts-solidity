import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

import { expect } from 'chai';
import { BigNumberish, utils } from 'ethers';
import hre from 'hardhat';

import { ERC165, ERC1155Supply, ERC1155SupplyOwnable, ERC1155TieredSales, TieredSalesOwnable } from '../../typechain';
import { ERC1155Base } from '../../typechain/ERC1155Base';
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

const deployERC1155WithSales = async ({
  tiers = DEFAULT_TIERS,
  initializations = [],
}: {
  tiers?: (Tier & { overrideTokenId?: BigNumberish })[];
  initializations?: Initialization[];
} = {}) => {
  return deployDiamond({
    facets: [
      // Base
      'ERC1155',
      // Features
      'ERC1155TieredSales',
      // Administration
      'ERC165Ownable',
      'ERC1155SupplyOwnable',
      'TieredSalesOwnable',
    ],
    initializations: [
      {
        facet: 'ERC165Ownable',
        function: 'setERC165',
        args: [['0xd9b67a26', '0x744f4bd4'], []],
      },
      {
        facet: 'ERC1155SupplyOwnable',
        function: 'setMaxSupply',
        args: [0, 8000],
      },
      {
        facet: 'ERC1155SupplyOwnable',
        function: 'setMaxSupply',
        args: [1, 8000],
      },
      {
        facet: 'TieredSalesOwnable',
        function: 'configureTiering(uint256[],(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256)[])',
        args: [Object.keys(tiers), Object.values(tiers)],
      },
      {
        facet: 'ERC1155TieredSalesOwnable',
        function: 'configureTierTokenId(uint256[],uint256[])',
        args: [Object.keys(tiers), tiers.map((t, i) => (t.overrideTokenId !== undefined ? t.overrideTokenId : i))], // Use tier index as token id
      },
      ...initializations,
    ],
  });
};

describe('ERC1155 Tiered Sales', function () {
  it('should return true when checking interfaces', async function () {
    await setupTest();

    const diamond = await deployERC1155WithSales();
    const erc165Facet = await hre.ethers.getContractAt<ERC165>('src/introspection/ERC165.sol:ERC165', diamond.address);

    // ERC1155
    expect(await erc165Facet.supportsInterface('0xd9b67a26')).to.be.equal(true);
  });

  it('should mint by tier multiple times until reached max allowance in allowlist', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });

    const erc1155Facet = await hre.ethers.getContractAt<ERC1155Base>('ERC1155Base', diamond.address);
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      2,
      3,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther('0.18'),
      },
    );

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      1,
      3,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther('0.06'),
      },
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
          }),
        ),
        {
          value: utils.parseEther('0.06'),
        },
      ),
    ).to.be.revertedWith('MAXED_ALLOWANCE');

    expect(await erc1155Facet.balanceOf(userA.signer.address, 0)).to.equal(3);
  });

  it('should mint by tier when 1 tier, no allowlist, with native currency', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const erc1155Facet = await hre.ethers.getContractAt<ERC1155Base>('ERC1155Base', diamond.address);
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
      value: utils.parseEther('0.12'),
    });

    expect(await erc1155Facet.balanceOf(userA.signer.address, 0)).to.be.equal(2);
    expect(await erc1155Facet.balanceOf(userA.signer.address, 1)).to.be.equal(0);
  });

  it('should get wallet minted amount by tier', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
      value: utils.parseEther('0.12'),
    });

    expect(await tieredSalesFacet.walletMintedByTier(0, userA.signer.address)).to.be.equal(2);
  });

  it('should fail when minting a non-existing tier', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(555, 2, 0, [], {
        value: utils.parseEther('0.12'),
      }),
    ).to.be.revertedWith('NOT_EXISTS');
  });

  it('should fail when minting a tier that is not started yet', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) + 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
        value: utils.parseEther('0.12'),
      }),
    ).to.be.revertedWith('NOT_STARTED');
  });

  it('should fail when minting a tier that is already ended', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) - 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
        value: utils.parseEther('0.12'),
      }),
    ).to.be.revertedWith('ALREADY_ENDED');
  });

  it('should fail when minting a tier and wallet is not allowlisted', async function () {
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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userD.signer).onTierAllowlist(
        0,
        userD.signer.address,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userD.signer.address,
            maxAllowance: 2,
          }),
        ),
      ),
    ).to.be.equal(false);

    await expect(
      tieredSalesFacet.connect(userD.signer).mintByTier(
        0,
        2,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userD.signer.address,
            maxAllowance: 2,
          }),
        ),
        {
          value: utils.parseEther('0.12'),
        },
      ),
    ).to.be.revertedWith('NOT_ALLOWLISTED');
  });

  it('should fail when minting a tier and passed max allowance is wrong vs allowlist', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userB.signer).onTierAllowlist(
        0,
        userB.signer.address,
        5,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 3,
          }),
        ),
      ),
    ).to.be.equal(false);

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(
        0,
        2,
        5,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 3,
          }),
        ),
        {
          value: utils.parseEther('0.12'),
        },
      ),
    ).to.be.revertedWith('NOT_ALLOWLISTED');
  });

  it('should fail when minting a tier and amount is higher than max allowance in allowlist', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
      ),
    ).to.be.equal(true);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        4,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
        {
          value: utils.parseEther('0.24'),
        },
      ),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should fail when minting a tier and amount + prev mints is higher than max allowance in allowlist', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      2,
      3,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther('0.12'),
      },
    );

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        2,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
        {
          value: utils.parseEther('0.12'),
        },
      ),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should mint by tier when amount is equal to max per wallet even though allowance is high in allowlist', async function () {
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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        30,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 30,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      5,
      30,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 30,
        }),
      ),
      {
        value: utils.parseEther('0.30'),
      },
    );
  });

  it('should fail when minting a tier and amount is higher than max per wallet even though allowance is high enough in allowlist', async function () {
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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        30,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 30,
          }),
        ),
      ),
    ).to.be.equal(true);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        6,
        30,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 30,
          }),
        ),
        {
          value: utils.parseEther('0.36'),
        },
      ),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should fail when minting a tier and amount + prev mints is higher than max per wallet even though allowance is high enough in allowlist', async function () {
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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        30,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 30,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      4,
      30,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 30,
        }),
      ),
      {
        value: utils.parseEther('0.36'),
      },
    );

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        2,
        30,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 30,
          }),
        ),
        {
          value: utils.parseEther('0.36'),
        },
      ),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should mint by tier multiple times until reached max allowance in allowlist', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userA.signer).onTierAllowlist(
        0,
        userA.signer.address,
        3,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 3,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      2,
      3,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther('0.18'),
      },
    );

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      1,
      3,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 3,
        }),
      ),
      {
        value: utils.parseEther('0.06'),
      },
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
          }),
        ),
        {
          value: utils.parseEther('0.06'),
        },
      ),
    ).to.be.revertedWith('MAXED_ALLOWANCE');
  });

  it('should fail to mint by tier if tier allocation is filled up', async function () {
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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 8,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      5,
      8,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 8,
        }),
      ),
      {
        value: utils.parseEther('5'),
      },
    );

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        1,
        8,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userA.signer.address,
            maxAllowance: 8,
          }),
        ),
        {
          value: utils.parseEther('1'),
        },
      ),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');
  });

  it('should fail when minting a tier with allowlist without proof', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
        value: utils.parseEther('0.12'),
      }),
    ).to.be.revertedWith('NOT_ALLOWLISTED');
  });

  it('should fail when minting a tier with allowlist with proof of another wallet', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userB.signer).onTierAllowlist(
        0,
        userB.signer.address,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 2,
          }),
        ),
      ),
    ).to.be.equal(true);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(
        0,
        2,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 2,
          }),
        ),
        {
          value: utils.parseEther('0.12'),
        },
      ),
    ).to.be.revertedWith('NOT_ALLOWLISTED');
  });

  it('should mint by tier when wallet is allowlisted', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userB.signer).onTierAllowlist(
        0,
        userB.signer.address,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 2,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userB.signer).mintByTier(
      0,
      2,
      2,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userB.signer.address,
          maxAllowance: 2,
        }),
      ),
      {
        value: utils.parseEther('0.12'),
      },
    );
  });

  it('should mint by tier when wallet is allowlisted one by one', async function () {
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
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(
      await tieredSalesFacet.connect(userB.signer).onTierAllowlist(
        0,
        userB.signer.address,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 2,
          }),
        ),
      ),
    ).to.be.equal(true);

    await tieredSalesFacet.connect(userB.signer).mintByTier(
      0,
      1,
      2,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userB.signer.address,
          maxAllowance: 2,
        }),
      ),
      {
        value: utils.parseEther('0.06'),
      },
    );

    await tieredSalesFacet.connect(userB.signer).mintByTier(
      0,
      1,
      2,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userB.signer.address,
          maxAllowance: 2,
        }),
      ),
      {
        value: utils.parseEther('0.06'),
      },
    );
  });

  it('should fail when minting a tier when max per wallet is reached', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 5, 0, [], {
      value: utils.parseEther('0.30'),
    });

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 0, [], {
        value: utils.parseEther('0.06'),
      }),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should fail when minting a tier and amount + prev mints is asking for more than remaining per-wallet allocation', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 4, 0, [], {
      value: utils.parseEther('0.24'),
    });

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
        value: utils.parseEther('0.12'),
      }),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should fail when minting a tier and not enough ether is sent', async function () {
    const { userA } = await setupTest();

    const diamond = await deployERC1155WithSales();
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await expect(
      tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 0, [], {
        value: utils.parseEther('0.11'),
      }),
    ).to.be.revertedWith('INSUFFICIENT_AMOUNT');
  });

  it('should mint by tier when multiple tiers and have dedicated max per wallet', async function () {
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
          maxPerWallet: 3,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 0,
          maxAllocation: 5000,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.2'),
          reserved: 0,
          maxAllocation: 5000,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.01'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [2, 8000],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    await tieredSalesFacet.connect(userB.signer).mintByTier(
      0,
      2,
      2,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userB.signer.address,
          maxAllowance: 2,
        }),
      ),
      {
        value: utils.parseEther('0.12'),
      },
    );

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(
        0,
        1,
        2,
        mkt.getHexProof(
          generateAllowlistLeaf({
            address: userB.signer.address,
            maxAllowance: 2,
          }),
        ),
        {
          value: utils.parseEther('0.06'),
        },
      ),
    ).to.be.revertedWith('MAXED_ALLOWANCE');

    await tieredSalesFacet.connect(userB.signer).mintByTier(1, 5, 0, [], {
      value: utils.parseEther('1'),
    });

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(1, 1, 0, [], {
        value: utils.parseEther('0.6'),
      }),
    ).to.be.revertedWith('EXCEEDS_MAX');

    await tieredSalesFacet.connect(userB.signer).mintByTier(2, 1, 0, [], {
      value: utils.parseEther('0.01'),
    });

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(2, 1, 0, [], {
        value: utils.parseEther('0.01'),
      }),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should fail to mint by tier if remaining allocation is fully reserved (example A)', async function () {
    const { userA, userB, userC } = await setupTest();
    const TIER_ZERO = 0;
    const TIER_ONE = 1;
    const TIER_TWO = 2;

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

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 3,
          merkleRoot: mkt.getHexRoot(),
          price: utils.parseEther('0.06'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 8,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.2'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('0.01'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const supplyFacet = await hre.ethers.getContractAt<ERC1155Supply>('ERC1155Supply', diamond.address);
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(0)).to.be.equal(10);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(1)).to.be.equal(5);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(2)).to.be.equal(5);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      TIER_ZERO,
      2,
      8,
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 8,
        }),
      ),
      {
        value: utils.parseEther('0.12'),
      },
    );

    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(0)).to.be.equal(8);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(1)).to.be.equal(5);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(2)).to.be.equal(5);

    await tieredSalesFacet.connect(userB.signer).mintByTier(
      TIER_ONE,
      3, // count
      8, // max allowance
      mkt.getHexProof(
        generateAllowlistLeaf({
          address: userB.signer.address,
          maxAllowance: 8,
        }),
      ),
      {
        value: utils.parseEther('0.6'),
      },
    );

    expect(await supplyFacet.connect(userB.signer).totalSupply(33)).to.be.equal(5);
    expect(await tieredSalesFacet.connect(userB.signer).tierMints(TIER_ZERO)).to.be.equal(2);
    expect(await tieredSalesFacet.connect(userB.signer).tierMints(TIER_ONE)).to.be.equal(3);
    expect(await tieredSalesFacet.connect(userB.signer).tierMints(TIER_TWO)).to.be.equal(0);

    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(0)).to.be.equal(5);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(1)).to.be.equal(2);
    expect(await tieredSalesFacet.connect(userB.signer).remainingForTier(2)).to.be.equal(2);

    await tieredSalesFacet.connect(userC.signer).mintByTier(TIER_TWO, 2, 0, [], {
      value: utils.parseEther('0.02'),
    });

    expect(await supplyFacet.connect(userB.signer).totalSupply(33)).to.be.equal(7);

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(TIER_ONE, 1, 1, [], {
        value: utils.parseEther('0.2'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(TIER_TWO, 1, 1, [], {
        value: utils.parseEther('0.01'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');
  });

  it('should fail to mint by tier if remaining allocation is fully reserved (example B)', async function () {
    const { userA, userB } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 3,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 20],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['17', '12', '12', '15']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 3, 100, [], {
      value: utils.parseEther('3'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['14', '12', '12', '15']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 4, 100, [], {
      value: utils.parseEther('4'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['10', '8', '8', '11']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(2, 7, 100, [], {
      value: utils.parseEther('7'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['3', '1', '1', '4']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(3, 2, 100, [], {
      value: utils.parseEther('2'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['3', '1', '1', '2']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 2, 100, [], {
      value: utils.parseEther('2'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['1', '1', '1', '2']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(2, 1, 100, [], {
      value: utils.parseEther('1'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['0', '0', '0', '1']);

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(0, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(1, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(2, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await tieredSalesFacet.connect(userB.signer).mintByTier(3, 1, 100, [], {
      value: utils.parseEther('1'),
    });

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(3, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');
  });

  it('should fail to mint by tier if remaining allocation is fully reserved (example C)', async function () {
    const { userA, userB } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 10,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 10,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 10,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 20],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['10', '0', '0', '10']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 10, 100, [], {
      value: utils.parseEther('10'),
    });
    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['0', '0', '0', '10']);

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(0, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(1, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(2, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await tieredSalesFacet.connect(userB.signer).mintByTier(3, 10, 100, [], {
      value: utils.parseEther('10'),
    });

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(3, 1, 100, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_MAX');
  });

  it('should mint for a tier if a new address is getting allowlisted and applied for that tier', async function () {
    const { deployer, userA, userB } = await setupTest();

    const mkt1 = generateAllowlistMerkleTree([
      {
        address: userA.signer.address,
        maxAllowance: 1,
      },
      {
        address: userB.signer.address,
        maxAllowance: 1,
      },
    ]);

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: mkt1.getHexRoot(),
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const tieredSalesOwnableFacet = await hre.ethers.getContractAt<TieredSalesOwnable>(
      'TieredSalesOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['6', '6', '6']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      0,
      1,
      1,
      mkt1.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 1,
        }),
      ),
      {
        value: utils.parseEther('1'),
      },
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['5', '6', '6']);

    const mkt2 = generateAllowlistMerkleTree([
      {
        address: userA.signer.address,
        maxAllowance: 1,
      },
    ]);

    await tieredSalesOwnableFacet
      .connect(deployer.signer)
      ['configureTiering(uint256,(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256))'](1, {
        start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
        end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
        currency: ZERO_ADDRESS,
        price: utils.parseEther('1'),
        maxPerWallet: 2,
        merkleRoot: mkt2.getHexRoot(),
        reserved: 2,
        maxAllocation: 5000,
      });

    await tieredSalesFacet.connect(userA.signer).mintByTier(
      1,
      1,
      1,
      mkt2.getHexProof(
        generateAllowlistLeaf({
          address: userA.signer.address,
          maxAllowance: 1,
        }),
      ),
      {
        value: utils.parseEther('1'),
      },
    );
  });

  //
  // Changing Supply Tests
  //

  it('should fail to mint by tier if remaining allocation is fully reserved and starts in future (example D)', async function () {
    const { userA, userB } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) + 7 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 10 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 5,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 20],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['5', '5', '5', '5']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 5, 5, [], {
      value: utils.parseEther('5'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 5, 5, [], {
      value: utils.parseEther('5'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(2, 5, 5, [], {
      value: utils.parseEther('5'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
      (await tieredSalesFacet.remainingForTier(3)).toString(),
    ]).to.deep.equal(['0', '0', '0', '5']);

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(0, 1, 1, [], {
        value: utils.parseEther('1'),
      }),
    ).to.be.revertedWith('EXCEEDS_ALLOCATION');

    await expect(
      tieredSalesFacet.connect(userB.signer).mintByTier(3, 5, 5, [], {
        value: utils.parseEther('5'),
      }),
    ).to.be.revertedWith('NOT_STARTED');
  });

  // TODO Should we override setMaxSupply when using TieredSales in 1155 cleanly?
  it.skip('should fail when total remaining supply become less than remaining reserved spots', async function () {
    const { deployer, userA } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 3,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const supplyOwnableFacet = await hre.ethers.getContractAt<ERC1155SupplyOwnable>(
      'ERC1155SupplyOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['8', '7', '5']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
      value: utils.parseEther('1'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 2, 2, [], {
      value: utils.parseEther('2'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['7', '5', '5']);

    // changing total supply to be less than reserved spots
    await expect(supplyOwnableFacet.connect(deployer.signer).setMaxSupply(33, 4)).to.be.revertedWith(
      'LOWER_THAN_RESERVED',
    );
  });

  // TODO Should we override setMaxSupply when using TieredSales in 1155 cleanly?
  it.skip('should fail when total remaining supply becomes less than already minted supply', async function () {
    const { deployer, userA } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 3,
          maxAllocation: 5000,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const supplyOwnableFacet = await hre.ethers.getContractAt<ERC1155SupplyOwnable>(
      'ERC1155SupplyOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['8', '7', '5']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
      value: utils.parseEther('1'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 1, 2, [], {
      value: utils.parseEther('1'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['7', '6', '5']);

    // changing total supply to be less than reserved spots
    await expect(supplyOwnableFacet.connect(deployer.signer).setMaxSupply(33, 1)).to.be.revertedWith(
      'LOWER_THAN_SUPPLY',
    );
  });

  it('should mint only reserved spots for a tier when new max supply equals total reserved spots', async function () {
    const { deployer, userA, userB } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 3,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 1,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const supplyOwnableFacet = await hre.ethers.getContractAt<ERC1155SupplyOwnable>(
      'ERC1155SupplyOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['8', '7', '5']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
      value: utils.parseEther('1'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 2, 2, [], {
      value: utils.parseEther('2'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['7', '5', '5']);

    // changing total supply to be less than reserved spots
    await supplyOwnableFacet.connect(deployer.signer).setMaxSupply(33, 5);

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['2', '0', '0']);

    await tieredSalesFacet.connect(userB.signer).mintByTier(0, 2, 2, [], {
      value: utils.parseEther('2'),
    });
  });

  //
  // Changing Reserved Spots Tests
  //

  it('should mint for a tier with zero reserved if there is still supply and the reserved spots for that tier increases', async function () {
    const { deployer, userA, userB } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 3,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 2,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const tieredSalesOwnableFacet = await hre.ethers.getContractAt<TieredSalesOwnable>(
      'TieredSalesOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['8', '7', '5']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
      value: utils.parseEther('1'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 2, 2, [], {
      value: utils.parseEther('2'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['7', '5', '5']);

    await tieredSalesOwnableFacet
      .connect(deployer.signer)
      ['configureTiering(uint256,(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256))'](2, {
        start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
        end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
        currency: ZERO_ADDRESS,
        price: utils.parseEther('1'),
        maxPerWallet: 2,
        merkleRoot: ZERO_BYTES32,
        reserved: 2,
        maxAllocation: 5000,
      });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['5', '3', '5']);

    await tieredSalesFacet.connect(userB.signer).mintByTier(2, 2, 2, [], {
      value: utils.parseEther('2'),
    });
  });

  // TODO Should we enforce max supply in tiered sales extension of 1155?
  it.skip('should not be ale to increase reserved spots for a tier when the whole supply is already reserved', async function () {
    const { deployer, userA } = await setupTest();

    const diamond = await deployERC1155WithSales({
      tiers: [
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 5,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
        {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          price: utils.parseEther('1'),
          reserved: 0,
          maxAllocation: 5000,
          overrideTokenId: 33,
        },
      ],
      initializations: [
        {
          facet: 'ERC1155SupplyOwnable',
          function: 'setMaxSupply',
          args: [33, 10],
        },
      ],
    });
    const tieredSalesFacet = await hre.ethers.getContractAt<ERC1155TieredSales>('ERC1155TieredSales', diamond.address);
    const tieredSalesOwnableFacet = await hre.ethers.getContractAt<TieredSalesOwnable>(
      'TieredSalesOwnable',
      diamond.address,
    );

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['5', '5', '0']);

    await tieredSalesFacet.connect(userA.signer).mintByTier(0, 1, 1, [], {
      value: utils.parseEther('1'),
    });
    await tieredSalesFacet.connect(userA.signer).mintByTier(1, 2, 2, [], {
      value: utils.parseEther('2'),
    });

    expect([
      (await tieredSalesFacet.remainingForTier(0)).toString(),
      (await tieredSalesFacet.remainingForTier(1)).toString(),
      (await tieredSalesFacet.remainingForTier(2)).toString(),
    ]).to.deep.equal(['4', '3', '0']);

    await expect(
      tieredSalesOwnableFacet
        .connect(deployer.signer)
        ['configureTiering(uint256,(uint256,uint256,address,uint256,uint256,bytes32,uint256,uint256))'](2, {
          start: Math.floor(+new Date() / 1000) - 4 * 24 * 60 * 60,
          end: Math.floor(+new Date() / 1000) + 6 * 24 * 60 * 60,
          currency: ZERO_ADDRESS,
          price: utils.parseEther('1'),
          maxPerWallet: 2,
          merkleRoot: ZERO_BYTES32,
          reserved: 2,
          maxAllocation: 5000,
        }),
    ).to.be.revertedWith('MAX_SUPPLY_EXCEEDED');
  });
});
