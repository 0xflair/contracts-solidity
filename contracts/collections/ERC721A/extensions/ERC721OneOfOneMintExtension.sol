// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "./ERC721AMinterExtension.sol";
import "./ERC721PerTokenMetadataExtension.sol";

import {IERC721OneOfOneMintExtension} from "../../ERC721/extensions/ERC721OneOfOneMintExtension.sol";

/**
 * @dev Extension to allow owner to mint 1-of-1 NFTs by providing dedicated metadata URI for each token.
 */
abstract contract ERC721OneOfOneMintExtension is
    IERC721OneOfOneMintExtension,
    Ownable,
    ERC165Storage,
    AccessControl,
    ERC721AMinterExtension,
    ERC721PerTokenMetadataExtension
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() {
        _registerInterface(type(IERC721OneOfOneMintExtension).interfaceId);
    }

    /* ADMIN */

    function mintWithTokenURIsByOwner(
        address to,
        uint256 count,
        string[] memory tokenURIs
    ) external onlyOwner {
        uint256 startingTokenId = _nextTokenId();
        _mintTo(to, count);
        for (uint256 i = 0; i < count; i++) {
            _setTokenURI(startingTokenId + i, tokenURIs[i]);
        }
    }

    function mintWithTokenURIsByRole(
        address to,
        uint256 count,
        string[] memory tokenURIs
    ) external {
        require(hasRole(MINTER_ROLE, _msgSender()), "NOT_MINTER_ROLE");

        uint256 startingTokenId = _nextTokenId();
        _mintTo(to, count);
        for (uint256 i = 0; i < count; i++) {
            _setTokenURI(startingTokenId + i, tokenURIs[i]);
        }
    }

    /* PUBLIC */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            ERC165Storage,
            AccessControl,
            ERC721AMinterExtension,
            ERC721PerTokenMetadataExtension
        )
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(
            ERC721A,
            ERC721PerTokenMetadataExtension,
            IERC721OneOfOneMintExtension
        )
        returns (string memory)
    {
        return ERC721PerTokenMetadataExtension.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721A, ERC721PerTokenMetadataExtension)
    {
        return ERC721PerTokenMetadataExtension._burn(tokenId);
    }
}
