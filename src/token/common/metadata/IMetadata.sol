// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface IMetadata {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function baseURI() external view returns (string memory);

    function baseURILocked() external view returns (bool);

    function uriSuffix() external view returns (string memory);

    function uriSuffixLocked() external view returns (bool);

    function fallbackURI() external view returns (string memory);

    function fallbackURILocked() external view returns (bool);

    function lastLockedTokenId() external view returns (uint256);
}