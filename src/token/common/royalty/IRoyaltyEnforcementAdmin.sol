// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

/**
 * @dev Manages where on-chain royalties must be enforced by blocklisting marketplaces with optional royalty.
 */
interface IRoyaltyEnforcementAdmin {
    function toggleRoyaltyEnforcement(bool enforce) external;
}
