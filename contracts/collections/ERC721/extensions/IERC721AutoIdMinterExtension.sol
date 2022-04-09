// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

interface IERC721AutoIdMinterExtension {
    function setMaxSupply(uint256 newValue) external;

    function freezeMaxSupply() external;

    function totalSupply() external view returns (uint256);
}
