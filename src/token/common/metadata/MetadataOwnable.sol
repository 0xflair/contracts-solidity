// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../../access/ownable/OwnableInternal.sol";

import "./MetadataAdminInternal.sol";
import "./MetadataStorage.sol";
import "./IMetadataAdmin.sol";

/**
 * @title Metadata - Admin - Ownable
 * @notice Allows diamond owner to change base, per-token, and fallback URIs, as wel as freezing URIs.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies IMetadata
 * @custom:provides-interfaces IMetadataAdmin
 */
contract MetadataOwnable is IMetadataAdmin, MetadataAdminInternal, OwnableInternal {
    function setName(string calldata name) external virtual override onlyOwner {
        _setName(name);
    }

    function setSymbol(string calldata symbol) external virtual override onlyOwner {
        _setSymbol(symbol);
    }

    function lockNameAndSymbol() external virtual override onlyOwner {
        _lockNameAndSymbol();
    }

    function setBaseURI(string calldata newBaseURI) public virtual onlyOwner {
        _setBaseURI(newBaseURI);
    }

    function setFallbackURI(string calldata newFallbackURI) public virtual onlyOwner {
        _setFallbackURI(newFallbackURI);
    }

    function setURISuffix(string calldata newURISuffix) public virtual onlyOwner {
        _setURISuffix(newURISuffix);
    }

    function setURI(uint256 tokenId, string calldata newTokenURI) public virtual onlyOwner {
        _setURI(tokenId, newTokenURI);
    }

    function setURIBatch(uint256[] calldata tokenIds, string[] calldata newTokenURIs) public virtual onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _setURI(tokenIds[i], newTokenURIs[i]);
        }
    }

    function lockBaseURI() public virtual onlyOwner {
        _lockBaseURI();
    }

    function lockFallbackURI() public virtual onlyOwner {
        _lockFallbackURI();
    }

    function lockURISuffix() public virtual onlyOwner {
        _lockURISuffix();
    }

    function lockURIUntil(uint256 tokenId) public virtual onlyOwner {
        _lockURIUntil(tokenId);
    }
}
