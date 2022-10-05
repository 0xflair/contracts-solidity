// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../extensions/supply/ERC1155SupplyInternal.sol";
import "../../extensions/supply/ERC1155SupplyStorage.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "./ERC1155SupplyAdminStorage.sol";
import "./IERC1155SupplyAdmin.sol";

/**
 * @title ERC1155 - Supply - Admin - Ownable
 * @notice Allows owner of a EIP-1155 contract to change max supply of token IDs.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xd9b67a26 0x744f4bd4
 * @custom:provides-interfaces 0xf0d6039e
 */
contract ERC1155SupplyOwnable is IERC1155SupplyAdmin, ERC1155SupplyInternal, OwnableInternal {
    using ERC1155SupplyStorage for ERC1155SupplyStorage.Layout;
    using ERC1155SupplyAdminStorage for ERC1155SupplyAdminStorage.Layout;

    function setMaxSupply(uint256 tokenId, uint256 newValue) public virtual onlyOwner {
        if (ERC1155SupplyAdminStorage.layout().maxSupplyFrozen[tokenId]) {
            revert ErrMaxSupplyFrozen();
        }

        _setMaxSupply(tokenId, newValue);
    }

    function setMaxSupplyBatch(uint256[] calldata tokenIds, uint256[] calldata newValues) public virtual onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (ERC1155SupplyAdminStorage.layout().maxSupplyFrozen[tokenIds[i]]) {
                revert ErrMaxSupplyFrozen();
            }
        }

        _setMaxSupplyBatch(tokenIds, newValues);
    }

    function freezeMaxSupply(uint256 tokenId) public virtual onlyOwner {
        ERC1155SupplyAdminStorage.layout().maxSupplyFrozen[tokenId] = true;
    }

    function freezeMaxSupplyBatch(uint256[] calldata tokenIds) public virtual onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            ERC1155SupplyAdminStorage.layout().maxSupplyFrozen[tokenIds[i]] = true;
        }
    }
}
