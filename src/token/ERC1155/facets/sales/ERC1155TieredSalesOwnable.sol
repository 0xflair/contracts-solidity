// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../access/ownable/OwnableInternal.sol";
import "./ERC1155TieredSalesStorage.sol";
import "./IERC1155TieredSalesAdmin.sol";

/**
 * @title Allow owner of diamond to manage ERC1155 sale tiers.
 */
contract ERC1155TieredSalesOwnable is IERC1155TieredSalesAdmin, OwnableInternal {
    using ERC1155TieredSalesStorage for ERC1155TieredSalesStorage.Layout;

    function configureTierTokenId(uint256 tierId, uint256 tokenId) external onlyOwner {
        ERC1155TieredSalesStorage.layout().tierToTokenId[tierId] = tokenId;
    }

    function configureTierTokenId(uint256[] calldata tierIds, uint256[] calldata tokenIds) external onlyOwner {
        require(
            tierIds.length == tokenIds.length,
            "ERC1155TieredSalesOwnable: tierIds and tokenIds must be same length"
        );

        for (uint256 i = 0; i < tierIds.length; i++) {
            ERC1155TieredSalesStorage.layout().tierToTokenId[tierIds[i]] = tokenIds[i];
        }
    }
}
