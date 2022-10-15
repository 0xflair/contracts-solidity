// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./ITieredSales.sol";

library TieredSalesStorage {
    struct Layout {
        mapping(uint256 => bytes32) domainSeparators;
        uint256 totalReserved;
        uint256 reservedMints;
        mapping(uint256 => ITieredSales.Tier) tiers;
        mapping(uint256 => uint256) tierMints;
        mapping(uint256 => mapping(address => uint256)) walletMinted;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256("v2.flair.contracts.storage.TieredSales");

    /* Typehash for EIP-712 */
    bytes32 internal constant TIER_TICKET_TYPEHASH =
        keccak256("TierTicket(uint256 tierId,address minter,uint256 maxAllowance,uint256 validUntil)");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
