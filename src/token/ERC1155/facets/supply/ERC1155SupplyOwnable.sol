// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../extensions/supply/ERC1155SupplyInternal.sol";
import "../../extensions/supply/ERC1155SupplyStorage.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "./IERC1155SupplyAdmin.sol";

/**
 * @title ERC1155 - Supply - Admin - Ownable
 * @notice Allows owner of a EIP-1155 contract to change max supply of token IDs.
 * @dev See https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xd9b67a26 0x744f4bd4
 * @custom:provides-interfaces 0x5b2cf486
 */
contract ERC1155SupplyOwnable is IERC1155SupplyAdmin, ERC1155SupplyInternal, OwnableInternal {
    using ERC1155SupplyStorage for ERC1155SupplyStorage.Layout;

    function setMaxSupply(uint256 tokenId, uint256 newValue) public onlyOwner {
        _setMaxSupply(tokenId, newValue);
    }

    function setMaxSupplyBatch(uint256[] calldata tokenIds, uint256[] calldata newValues) public onlyOwner {
        _setMaxSupplyBatch(tokenIds, newValues);
    }
}
