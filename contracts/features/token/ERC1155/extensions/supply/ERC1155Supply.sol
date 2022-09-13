// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./ERC1155SupplyInternal.sol";

/**
 * @dev Extension of ERC1155 that adds tracking of total supply per id.
 *
 * Useful for scenarios where Fungible and Non-fungible tokens have to be
 * clearly identified. Note: While a totalSupply of 1 might mean the
 * corresponding is an NFT, there is no guarantees that no other token with the
 * same id are not going to be minted.
 */
abstract contract ERC1155Supply is ERC1155SupplyInternal {
    /**
     * @dev Total amount of tokens in with a given id.
     */
    function totalSupply(uint256 id) public view virtual returns (uint256) {
        return _totalSupply(id);
    }

    /**
     * @dev Maximum amount of tokens possible to exist for a given id.
     */
    function maxSupply(uint256 id) public view virtual returns (uint256) {
        return _maxSupply(id);
    }

    /**
     * @dev Indicates whether any token exist with a given id, or not.
     */
    function exists(uint256 id) public view virtual returns (bool) {
        return _exists(id);
    }
}
