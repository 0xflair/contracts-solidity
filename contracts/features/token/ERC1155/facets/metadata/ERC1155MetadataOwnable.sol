// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {IERC1155Metadata} from "./IERC1155Metadata.sol";
import {ERC1155MetadataInternal} from "./ERC1155MetadataInternal.sol";
import {ERC1155MetadataStorage} from "./ERC1155MetadataStorage.sol";
import {OwnableInternal} from "../../../../access/ownable/OwnableInternal.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ERC1155 metadata extension to allow updating as contract owner
 */
abstract contract ERC1155MetadataOwnable is
    IERC1155Metadata,
    ERC1155MetadataInternal,
    OwnableInternal
{
    function setBaseURI(string calldata newBaseURI) public onlyOwner {
        _setBaseURI(newBaseURI);
    }

    function setFallbackURI(string calldata newFallbackURI) public onlyOwner {
        _setFallbackURI(newFallbackURI);
    }

    function setTokenURI(uint256 tokenId, string calldata newTokenURI)
        public
        onlyOwner
    {
        _setTokenURI(tokenId, newTokenURI);
    }

    function setTokenURIBatch(
        uint256[] calldata tokenIds,
        string[] calldata newTokenURIs
    ) public onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _setTokenURI(tokenIds[i], newTokenURIs[i]);
        }
    }

    function lockBaseURI() public onlyOwner {
        _lockBaseURI();
    }

    function lockFallbackURI() public onlyOwner {
        _lockFallbackURI();
    }

    function lockTokenURIUntil(uint256 tokenId) public onlyOwner {
        _lockTokenURIUntil(tokenId);
    }
}
