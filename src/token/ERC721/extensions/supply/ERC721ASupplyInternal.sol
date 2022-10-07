// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

import "../../base/ERC721ABaseInternal.sol";
import "./ERC721SupplyStorage.sol";
import "./IERC721SupplyInternal.sol";

abstract contract ERC721ASupplyInternal is IERC721SupplyInternal, ERC721ABaseInternal {
    using ERC721SupplyStorage for ERC721SupplyStorage.Layout;

    function _maxSupply() internal view returns (uint256) {
        return ERC721SupplyStorage.layout().maxSupply;
    }

    /**
     * @dev See {ERC721A-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        if (to != address(0)) {
            if (_totalSupply() + quantity > ERC721SupplyStorage.layout().maxSupply) {
                revert ErrMaxSupplyExceeded();
            }
        }

        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }
}
