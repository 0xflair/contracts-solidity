// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./ITieredSales.sol";
import "./TieredSalesInternal.sol";

/**
 * @title Abstract sales mechanism for any asset (e.g NFTs) with multiple tiered pricing, allowlist and allocation plans.
 */
abstract contract TieredSales is ITieredSales, TieredSalesInternal {
    function onTierAllowlist(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata allowlistProof
    ) public view virtual returns (bool) {
        return super._onTierAllowlist(tierId, minter, maxAllowance, allowlistProof);
    }

    function verifySignature(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes calldata signature,
        uint256 validUntil
    ) public view virtual returns (bool) {
        return
            super._verifySignature(
                TieredSalesStorage.layout().tiers[tierId].signer,
                tierId,
                minter,
                maxAllowance,
                signature,
                validUntil
            );
    }

    function maxMintableForTier(
        uint256 tierId,
        address minter,
        uint256 maxAllowance
    ) public view virtual returns (uint256 maxMintable) {
        return super._maxMintableForTier(tierId, minter, maxAllowance);
    }

    function remainingForTier(uint256 tierId) public view virtual returns (uint256) {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        uint256 availableSupply = _availableSupplyForTier(tierId);
        uint256 availableAllocation = l.tiers[tierId].maxAllocation - l.tierMints[tierId];

        if (availableSupply < availableAllocation) {
            return availableSupply;
        } else {
            return availableAllocation;
        }
    }

    function walletMintedByTier(uint256 tierId, address wallet) public view virtual returns (uint256) {
        return TieredSalesStorage.layout().walletMinted[tierId][wallet];
    }

    function tierMints(uint256 tierId) public view virtual returns (uint256) {
        return TieredSalesStorage.layout().tierMints[tierId];
    }

    function totalReserved() external view virtual returns (uint256) {
        return TieredSalesStorage.layout().totalReserved;
    }

    function reservedMints() external view virtual returns (uint256) {
        return TieredSalesStorage.layout().reservedMints;
    }

    function tiers(uint256 tierId) external view virtual returns (Tier memory) {
        return TieredSalesStorage.layout().tiers[tierId];
    }
}
