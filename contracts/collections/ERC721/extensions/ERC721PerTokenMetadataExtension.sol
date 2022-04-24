// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @dev Extension to allow configuring collection and tokens metadata URI.
 *      In this extension each token will have a different independent token URI set by contract owner,
 */
abstract contract ERC721PerTokenMetadataExtension is Ownable, ERC721URIStorage {
    // ADMIN

    function setTokenURI(uint256 tokenId, string memory tokenURI)
        external
        onlyOwner
    {
        _setTokenURI(tokenId, tokenURI);
    }
}
