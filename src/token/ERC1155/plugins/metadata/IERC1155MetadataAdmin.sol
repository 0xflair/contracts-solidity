// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface IERC1155MetadataAdmin {
    function setBaseURI(string calldata newBaseURI) external;

    function setFallbackURI(string calldata newFallbackURI) external;

    function setURI(uint256 tokenId, string calldata newTokenURI) external;

    function setURIBatch(uint256[] calldata tokenIds, string[] calldata newTokenURIs) external;

    function lockBaseURI() external;

    function lockFallbackURI() external;

    function lockURIUntil(uint256 tokenId) external;
}
