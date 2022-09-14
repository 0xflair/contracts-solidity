// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./IERC1155Metadata.sol";
import "./ERC1155MetadataInternal.sol";
import "./ERC1155MetadataStorage.sol";

/**
 * @title ERC1155 - Metadata Extension
 * @notice Provides metadata for ERC1155 tokens according to standard. This extension supports base URI, per-token URI, and a fallback URI. You can also freeze URIs until a certain token ID.
 * @dev See https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions
 *
 * @custom:facet
 * @custom:dependency contracts/token/ERC1155/base/ERC1155Base.sol
 * @custom:peer-dependency contracts/token/ERC1155/facets/metadata/ERC1155MetadataOwnable.sol
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
