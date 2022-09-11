// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Supply.sol)

pragma solidity 0.8.15;

import "../base/ERC1155BaseInternal.sol";
import {ERC1155SupplyStorage} from "./ERC1155SupplyStorage.sol";

/**
 * @dev Extension of ERC1155 that adds tracking of total supply per id.
 *
 * Useful for scenarios where Fungible and Non-fungible tokens have to be
 * clearly identified. Note: While a totalSupply of 1 might mean the
 * corresponding is an NFT, there is no guarantees that no other token with the
 * same id are not going to be minted.
 */
abstract contract ERC1155SupplyInternal is ERC1155BaseInternal {
    using ERC1155SupplyStorage for ERC1155SupplyStorage.Layout;

    /**
     * @dev Total amount of tokens in with a given id.
     */
    function _totalSupply(uint256 id) internal view virtual returns (uint256) {
        return ERC1155SupplyStorage.layout().totalSupply[id];
    }

    /**
     * @dev Indicates whether any token exist with a given id, or not.
     */
    function _exists(uint256 id) internal view virtual returns (bool) {
        return ERC1155SupplyStorage.layout().totalSupply[id] > 0;
    }

    /**
     * @dev See {ERC1155-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                ERC1155SupplyStorage.layout().totalSupply[ids[i]] += amounts[i];
            }
        }

        if (to == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                uint256 id = ids[i];
                uint256 amount = amounts[i];
                uint256 supply = ERC1155SupplyStorage.layout().totalSupply[id];
                require(
                    supply >= amount,
                    "ERC1155: burn amount exceeds totalSupply"
                );
                unchecked {
                    ERC1155SupplyStorage.layout().totalSupply[id] =
                        supply -
                        amount;
                }
            }
        }
    }
}
