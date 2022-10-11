// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../extensions/supply/ERC721SupplyStorage.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "./ERC721SupplyAdminStorage.sol";
import "./IERC721SupplyAdmin.sol";

/**
 * @title ERC721 - Supply - Admin - Ownable
 * @notice Allows owner of a EIP-721 contract to change max supply of tokens.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies IERC721SupplyExtension
 * @custom:provides-interfaces IERC721SupplyAdmin
 */
contract ERC721SupplyOwnable is IERC721SupplyAdmin, OwnableInternal {
    using ERC721SupplyAdminStorage for ERC721SupplyAdminStorage.Layout;
    using ERC721SupplyStorage for ERC721SupplyStorage.Layout;

    function setMaxSupply(uint256 newValue) public virtual onlyOwner {
        if (ERC721SupplyAdminStorage.layout().maxSupplyFrozen) {
            revert ErrMaxSupplyFrozen();
        }

        ERC721SupplyStorage.layout().maxSupply = newValue;
    }

    function freezeMaxSupply() public virtual onlyOwner {
        ERC721SupplyAdminStorage.layout().maxSupplyFrozen = true;
    }

    function maxSupplyFrozen() public view virtual override returns (bool) {
        return ERC721SupplyAdminStorage.layout().maxSupplyFrozen;
    }
}
