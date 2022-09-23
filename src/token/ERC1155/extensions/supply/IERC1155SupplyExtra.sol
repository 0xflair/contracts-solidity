// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} to add batch view operations for supply.
 */
interface IERC1155SupplyExtra {
    /**
     * @dev Total amount of tokens for a list of IDs.
     */
    function totalSupplyBatch(uint256[] calldata ids) external view returns (uint256[] memory);

    /**
     * @dev Maximum amount of tokens possible to exist for a list of IDs.
     */
    function maxSupplyBatch(uint256[] calldata ids) external view returns (uint256[] memory);

    /**
     * @dev Indicates whether tokens exist given a list of IDs.
     */
    function existsBatch(uint256[] calldata ids) external view returns (bool[] memory);
}
