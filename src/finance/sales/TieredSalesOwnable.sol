// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./ITieredSalesAdmin.sol";
import "./TieredSalesInternal.sol";

import "../../access/ownable/OwnableInternal.sol";

/**
 * @title Tiered Sales - Admin - Ownable
 * @notice Allow contract owner to manage sale tiers.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies eip165:0x79f33254
 * @custom:provides-interfaces 0xf8458dcd
 */
contract TieredSalesOwnable is ITieredSalesAdmin, OwnableInternal, TieredSalesInternal {
    function configureTiering(uint256 tierId, ITieredSalesInternal.Tier calldata tier) external override onlyOwner {
        super._configureTiering(tierId, tier);
    }

    function configureTiering(uint256[] calldata tierIds, ITieredSalesInternal.Tier[] calldata tiers)
        external
        override
        onlyOwner
    {
        super._configureTiering(tierIds, tiers);
    }
}
