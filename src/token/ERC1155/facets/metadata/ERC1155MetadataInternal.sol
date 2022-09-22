// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IERC1155MetadataEvents.sol";
import "./ERC1155MetadataStorage.sol";

abstract contract ERC1155MetadataInternal is IERC1155MetadataEvents {
    function _setBaseURI(string memory baseURI) internal {
        require(!ERC1155MetadataStorage.layout().baseURILocked, "ERC1155Metadata: baseURI locked");
        ERC1155MetadataStorage.layout().baseURI = baseURI;
    }

    function _setFallbackURI(string memory baseURI) internal {
        require(!ERC1155MetadataStorage.layout().fallbackURILocked, "ERC1155Metadata: fallbackURI locked");
        ERC1155MetadataStorage.layout().baseURI = baseURI;
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal {
        require(tokenId > ERC1155MetadataStorage.layout().lastLockedTokenId, "ERC1155Metadata: tokenURI locked");
        ERC1155MetadataStorage.layout().tokenURIs[tokenId] = tokenURI;
        emit URI(tokenURI, tokenId);
    }

    function _setURISuffix(string memory uriSuffix) internal {
        require(!ERC1155MetadataStorage.layout().uriSuffixLocked, "ERC1155Metadata: uriSuffix locked");
        ERC1155MetadataStorage.layout().uriSuffix = uriSuffix;
    }

    function _lockBaseURI() internal {
        ERC1155MetadataStorage.layout().baseURILocked = true;
    }

    function _lockFallbackURI() internal {
        ERC1155MetadataStorage.layout().fallbackURILocked = true;
    }

    function _lockURIUntil(uint256 tokenId) internal {
        ERC1155MetadataStorage.layout().lastLockedTokenId = tokenId;
    }

    function _lockURISuffix() internal {
        ERC1155MetadataStorage.layout().uriSuffixLocked = true;
    }
}
