// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IERC1155Supply.sol";
import "./ERC1155SupplyInternal.sol";

/**
 * @dev Extension of ERC1155 that adds tracking of total supply per id.
 *
 * Useful for scenarios where Fungible and Non-fungible tokens have to be
 * clearly identified. Note: While a totalSupply of 1 might mean the
 * corresponding is an NFT, there is no guarantees that no other token with the
 * same id are not going to be minted.
 */
abstract contract ERC1155Supply is IERC1155Supply, ERC1155SupplyInternal {
    /**
     * @inheritdoc IERC1155Supply
     */
    function totalSupply(uint256 id) public view virtual returns (uint256) {
        return _totalSupply(id);
    }

    /**
     * @inheritdoc IERC1155Supply
     */
    function maxSupply(uint256 id) public view virtual returns (uint256) {
        return _maxSupply(id);
    }

    /**
     * @inheritdoc IERC1155Supply
     */
    function exists(uint256 id) public view virtual returns (bool) {
        return _exists(id);
    }
}
