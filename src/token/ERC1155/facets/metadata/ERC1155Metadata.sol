// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./IERC1155Metadata.sol";
import "./ERC1155MetadataInternal.sol";
import "./ERC1155MetadataStorage.sol";

/**
 * @title ERC1155 - Metadata
 * @notice Provides metadata for ERC1155 tokens according to standard. This extension supports base URI, per-token URI, and a fallback URI. You can also freeze URIs until a certain token ID.
 * @dev See https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xd9b67a26
 * @custom:provides-interfaces 0x0e89341c
 */
contract ERC1155Metadata is IERC1155Metadata, ERC1155MetadataInternal {
    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function uri(uint256 tokenId) public view virtual returns (string memory) {
        ERC1155MetadataStorage.Layout storage l = ERC1155MetadataStorage.layout();

        string memory tokenIdURI = l.tokenURIs[tokenId];
        string memory baseURI = l.baseURI;

        if (bytes(baseURI).length == 0) {
            return tokenIdURI;
        } else if (bytes(tokenIdURI).length > 0) {
            return string(abi.encodePacked(baseURI, tokenIdURI));
        } else {
            return string(abi.encodePacked(baseURI, l.fallbackURI, Strings.toString(tokenId)));
        }
    }
}
