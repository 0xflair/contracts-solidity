// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface IERC1155MetadataExtra {
    function baseURI() external view returns (string memory);

    function fallbackURI() external view returns (string memory);

    function uriSuffix() external view returns (string memory);

    function baseURILocked() external view returns (bool);

    function fallbackURILocked() external view returns (bool);

    function uriSuffixLocked() external view returns (bool);

    function lastLockedTokenId() external view returns (uint256);

    function uriBatch(uint256[] calldata tokenIds) external view returns (string[] memory);
}
