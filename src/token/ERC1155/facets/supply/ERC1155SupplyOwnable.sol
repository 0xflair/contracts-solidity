// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../extensions/supply/ERC1155SupplyInternal.sol";
import "../../extensions/supply/ERC1155SupplyStorage.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "./IERC1155SupplyAdmin.sol";

/**
 * @dev Extension of ERC1155 to allow owner to change the max supply per token ID.
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
