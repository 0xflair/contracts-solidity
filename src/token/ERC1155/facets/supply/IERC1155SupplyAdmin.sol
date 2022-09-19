// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface IERC1155SupplyAdmin {
    function setMaxSupply(uint256 tokenId, uint256 newValue) external;

    function setMaxSupplyBatch(uint256[] calldata tokenIds, uint256[] calldata newValues) external;
}
