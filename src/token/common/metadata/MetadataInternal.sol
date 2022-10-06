// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IMetadataInternal.sol";
import "./MetadataStorage.sol";

abstract contract MetadataInternal is IMetadataInternal {
    function _setBaseURI(string memory baseURI) internal virtual {
        require(!MetadataStorage.layout().baseURILocked, "Metadata: baseURI locked");
        MetadataStorage.layout().baseURI = baseURI;
    }

    function _setFallbackURI(string memory baseURI) internal virtual {
        require(!MetadataStorage.layout().fallbackURILocked, "Metadata: fallbackURI locked");
        MetadataStorage.layout().baseURI = baseURI;
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
        require(tokenId > MetadataStorage.layout().lastLockedTokenId, "Metadata: tokenURI locked");
        MetadataStorage.layout().tokenURIs[tokenId] = tokenURI;
        emit URI(tokenURI, tokenId);
    }

    function _setURISuffix(string memory uriSuffix) internal virtual {
        require(!MetadataStorage.layout().uriSuffixLocked, "Metadata: uriSuffix locked");
        MetadataStorage.layout().uriSuffix = uriSuffix;
    }

    function _lockBaseURI() internal virtual {
        MetadataStorage.layout().baseURILocked = true;
    }

    function _lockFallbackURI() internal virtual {
        MetadataStorage.layout().fallbackURILocked = true;
    }

    function _lockURIUntil(uint256 tokenId) internal virtual {
        MetadataStorage.layout().lastLockedTokenId = tokenId;
    }

    function _lockURISuffix() internal virtual {
        MetadataStorage.layout().uriSuffixLocked = true;
    }
}
