// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../base/ERC1155BaseInternal.sol";
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
     * @dev Total amount of tokens in with a given id.
     */
    function _maxSupply(uint256 id) internal view virtual returns (uint256) {
        return ERC1155SupplyStorage.layout().maxSupply[id];
    }

    /**
     * @dev Seta maximum amount of tokens possible to exist for a given token ID.
     */
    function _setMaxSupply(uint256 tokenId, uint256 newValue) internal {
        ERC1155SupplyStorage.layout().maxSupply[tokenId] = newValue;
    }

    /**
     * @dev Sets maximum amount of tokens possible to exist for multiple token IDs.
     */
    function _setMaxSupplyBatch(
        uint256[] calldata tokenIds,
        uint256[] calldata newValues
    ) internal {
        mapping(uint256 => uint256) storage l = ERC1155SupplyStorage
            .layout()
            .maxSupply;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            l[tokenIds[i]] = newValues[i];
        }
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
            mapping(uint256 => uint256)
                storage totalSupply = ERC1155SupplyStorage.layout().totalSupply;
            mapping(uint256 => uint256) storage maxSupply = ERC1155SupplyStorage
                .layout()
                .maxSupply;

            for (uint256 i = 0; i < ids.length; ++i) {
                totalSupply[ids[i]] += amounts[i];

                require(
                    totalSupply[ids[i]] <= maxSupply[ids[i]],
                    "SUPPLY_EXCEED_MAX"
                );
            }
        }

        if (to == address(0)) {
            mapping(uint256 => uint256)
                storage totalSupply = ERC1155SupplyStorage.layout().totalSupply;

            for (uint256 i = 0; i < ids.length; ++i) {
                uint256 id = ids[i];
                uint256 amount = amounts[i];
                uint256 supply = totalSupply[id];
                require(
                    supply >= amount,
                    "ERC1155: burn amount exceeds totalSupply"
                );
                unchecked {
                    totalSupply[id] = supply - amount;
                }
            }
        }
    }
}
