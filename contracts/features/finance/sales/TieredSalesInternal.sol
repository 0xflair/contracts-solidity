// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ITieredSalesEvents} from "./ITieredSalesEvents.sol";
import {TieredSalesStorage} from "./TieredSalesStorage.sol";

import {OwnableInternal} from "../../access/ownable/OwnableInternal.sol";
import {ERC2771ContextInternal} from "../../metatx/ERC2771ContextInternal.sol";

/**
 * @title Sales mechanism for NFTs with multiple tiered pricing, allowlist and allocation plans
 */
abstract contract TieredSalesInternal is
    ITieredSalesEvents,
    ERC2771ContextInternal,
    OwnableInternal
{
    using TieredSalesStorage for TieredSalesStorage.Layout;

    /* ADMIN */

    function configureTiering(uint256 tierId, Tier calldata tier)
        public
        onlyOwner
    {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        require(tier.maxAllocation >= l.tierMints[tierId], "LOWER_THAN_MINTED");

        if (l.tiers[tierId].reserved > 0) {
            require(tier.reserved >= l.tierMints[tierId], "LOW_RESERVE_AMOUNT");
        }

        if (l.tierMints[tierId] > 0) {
            require(
                tier.maxPerWallet >= l.tiers[tierId].maxPerWallet,
                "LOW_MAX_PER_WALLET"
            );
        }

        l.totalReserved -= l.tiers[tierId].reserved;
        l.tiers[tierId] = tier;
        l.totalReserved += tier.reserved;
    }

    function configureTiering(
        uint256[] calldata _tierIds,
        Tier[] calldata _tiers
    ) public onlyOwner {
        for (uint256 i = 0; i < _tierIds.length; i++) {
            configureTiering(_tierIds[i], _tiers[i]);
        }
    }

    /* PUBLIC */

    function _onTierAllowlist(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) internal view returns (bool) {
        return
            MerkleProof.verify(
                proof,
                TieredSalesStorage.layout().tiers[tierId].merkleRoot,
                _generateMerkleLeaf(minter, maxAllowance)
            );
    }

    function _eligibleForTier(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) internal view returns (uint256 maxMintable) {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        require(l.tiers[tierId].maxPerWallet > 0, "NOT_EXISTS");
        require(block.timestamp >= l.tiers[tierId].start, "NOT_STARTED");
        require(block.timestamp <= l.tiers[tierId].end, "ALREADY_ENDED");

        maxMintable =
            l.tiers[tierId].maxPerWallet -
            l.walletMinted[tierId][minter];

        if (l.tiers[tierId].merkleRoot != bytes32(0)) {
            require(
                l.walletMinted[tierId][minter] < maxAllowance,
                "MAXED_ALLOWANCE"
            );
            require(
                _onTierAllowlist(tierId, minter, maxAllowance, proof),
                "NOT_ALLOWLISTED"
            );

            uint256 remainingAllowance = maxAllowance -
                l.walletMinted[tierId][minter];

            if (maxMintable > remainingAllowance) {
                maxMintable = remainingAllowance;
            }
        }
    }

    function _executeSale(
        uint256 tierId,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) internal {
        address minter = _msgSender();

        uint256 maxMintable = _eligibleForTier(
            tierId,
            minter,
            maxAllowance,
            proof
        );

        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        require(count <= maxMintable, "EXCEEDS_MAX");
        require(
            count + l.tierMints[tierId] <= l.tiers[tierId].maxAllocation,
            "EXCEEDS_ALLOCATION"
        );

        if (l.tiers[tierId].currency == address(0)) {
            require(
                l.tiers[tierId].price * count <= msg.value,
                "INSUFFICIENT_AMOUNT"
            );
        } else {
            IERC20(l.tiers[tierId].currency).transferFrom(
                minter,
                address(this),
                l.tiers[tierId].price * count
            );
        }

        l.walletMinted[tierId][minter] += count;
        l.tierMints[tierId] += count;

        if (l.tiers[tierId].reserved > 0) {
            l.reservedMints += count;
        }
    }

    function walletMintedByTier(uint256 tierId, address wallet)
        public
        view
        returns (uint256)
    {
        return TieredSalesStorage.layout().walletMinted[tierId][wallet];
    }

    /* PRIVATE */

    function _generateMerkleLeaf(address account, uint256 maxAllowance)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(account, maxAllowance));
    }
}
