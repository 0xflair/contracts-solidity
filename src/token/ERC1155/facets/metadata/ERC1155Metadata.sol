// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./IERC1155Metadata.sol";
import "./IERC1155MetadataExtra.sol";
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
 * @custom:provides-interfaces 0x0e89341c 0x57bbc86d
 */
contract ERC1155Metadata is IERC1155Metadata, IERC1155MetadataExtra, ERC1155MetadataInternal {
    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function uri(uint256 tokenId) public view virtual returns (string memory) {
        ERC1155MetadataStorage.Layout storage l = ERC1155MetadataStorage.layout();

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

    function uriBatch(uint256[] calldata tokenIds) external view virtual returns (string[] memory) {
        string[] memory uris = new string[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uris[i] = uri(tokenIds[i]);
        }

        return uris;
    }

    function baseURI() external view virtual returns (string memory) {
        return ERC1155MetadataStorage.layout().baseURI;
    }

    function fallbackURI() external view virtual returns (string memory) {
        return ERC1155MetadataStorage.layout().fallbackURI;
    }

    function uriSuffix() external view virtual returns (string memory) {
        return ERC1155MetadataStorage.layout().uriSuffix;
    }

    function baseURILocked() external view virtual returns (bool) {
        return ERC1155MetadataStorage.layout().baseURILocked;
    }

    function fallbackURILocked() external view virtual returns (bool) {
        return ERC1155MetadataStorage.layout().fallbackURILocked;
    }

    function uriSuffixLocked() external view virtual returns (bool) {
        return ERC1155MetadataStorage.layout().uriSuffixLocked;
    }

    function lastLockedTokenId() external view virtual returns (uint256) {
        return ERC1155MetadataStorage.layout().lastLockedTokenId;
    }
}
