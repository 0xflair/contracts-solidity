// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./ITieredSalesAdmin.sol";
import "./TieredSalesInternal.sol";

import "../../access/ownable/OwnableInternal.sol";

/**
 * @title Allow owner of diamond to manage sale tiers.
 */
contract TieredSalesOwnable is
    ITieredSalesAdmin,
    OwnableInternal,
    TieredSalesInternal
{
    function configureTiering(
        uint256 tierId,
        ITieredSalesInternal.Tier calldata tier
    ) external override onlyOwner {
        super._configureTiering(tierId, tier);
    }

    function configureTiering(
        uint256[] calldata tierIds,
        ITieredSalesInternal.Tier[] calldata tiers
    ) external override onlyOwner {
        super._configureTiering(tierIds, tiers);
    }
}
