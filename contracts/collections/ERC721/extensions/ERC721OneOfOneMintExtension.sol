// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC721AutoIdMinterExtension.sol";
import "./ERC721PerTokenMetadataExtension.sol";

/**
 * @dev Extension to allow owner to mint 1-of-1 NFTs by providing dedicated metadata URI for each token.
 */
abstract contract ERC721OneOfOneMintExtension is
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
        uint256 startingTokenId = _getNextTokenId();
        _mintTo(to, count);
        for (uint256 i = 0; i < count; i++) {
            _setTokenURI(startingTokenId + i, tokenURIs[i]);
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
