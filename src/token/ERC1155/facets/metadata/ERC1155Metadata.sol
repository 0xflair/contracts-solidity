// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../../common/metadata/MetadataStorage.sol";
import "./IERC1155Metadata.sol";

/**
 * @title ERC1155 - Metadata
 * @notice Provides metadata for ERC1155 tokens according to standard.
 * @dev See https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xc16c2a44
 * @custom:provides-interfaces 0x0e89341c
 */
contract ERC1155Metadata is IERC1155Metadata {
    using MetadataStorage for MetadataStorage.Layout;

    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function uri(uint256 tokenId) public view virtual returns (string memory) {
        MetadataStorage.Layout storage l = MetadataStorage.layout();

        string memory _tokenIdURI = l.tokenURIs[tokenId];
        string memory _baseURI = l.baseURI;

        if (bytes(_tokenIdURI).length > 0) {
            return _tokenIdURI;
        } else if (bytes(l.fallbackURI).length > 0) {
            return l.fallbackURI;
        } else if (bytes(_baseURI).length > 0) {
            return string(abi.encodePacked(_baseURI, Strings.toString(tokenId), l.uriSuffix));
        } else {
            return "";
        }
    }
}
