// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

/**
 * @dev Shows if royalties are enforced by blocklisting marketplaces with optional royalty.
 */
interface IRoyaltyEnforcement {
    function royaltiesEnforced() external view returns (bool);
}
