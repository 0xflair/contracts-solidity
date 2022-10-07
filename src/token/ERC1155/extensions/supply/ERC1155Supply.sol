// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./ERC1155SupplyInternal.sol";
import "./IERC1155Supply.sol";
import "./IERC1155SupplyExtra.sol";

/**
 * @dev Extension of ERC1155 that adds tracking of total supply per id.
 */
abstract contract ERC1155Supply is IERC1155Supply, IERC1155SupplyExtra, ERC1155SupplyInternal {
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

    /**
     * @inheritdoc IERC1155SupplyExtra
     */
    function totalSupplyBatch(uint256[] calldata ids) public view virtual override returns (uint256[] memory) {
        uint256[] memory totalSupplies = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            totalSupplies[i] = _totalSupply(ids[i]);
        }
        return totalSupplies;
    }

    /**
     * @inheritdoc IERC1155SupplyExtra
     */
    function maxSupplyBatch(uint256[] calldata ids) public view virtual override returns (uint256[] memory) {
        uint256[] memory maxSupplies = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            maxSupplies[i] = _maxSupply(ids[i]);
        }
        return maxSupplies;
    }

    /**
     * @inheritdoc IERC1155SupplyExtra
     */
    function existsBatch(uint256[] calldata ids) public view virtual override returns (bool[] memory) {
        bool[] memory existences = new bool[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            existences[i] = _exists(ids[i]);
        }
        return existences;
    }
}
