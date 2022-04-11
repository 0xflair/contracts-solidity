// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC721AutoIdMinterExtension.sol";
import "./ERC721PerTokenMetadataExtension.sol";

/**
 * @dev Extension to allow owner to mint directly by providing independent metadata URIs for tokens.
 */
abstract contract ERC721MetadataMintExtension is
    Ownable,
    ERC721AutoIdMinterExtension,
    ERC721PerTokenMetadataExtension
{
    // ADMIN

    function mintWithTokenURIsByOwner(
        address to,
        uint256 count,
        string[] memory tokenURIs
    ) external onlyOwner {
        _mintTo(to, count);
        for (uint256 i = 0; i < count; i++) {
            _setTokenURI(uint256(i), tokenURIs[i]);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        return super._burn(tokenId);
    }
}
