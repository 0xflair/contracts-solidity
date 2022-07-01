// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "erc721a/contracts/ERC721A.sol";

import {IERC721PrefixedMetadataExtension} from "../../ERC721/extensions/ERC721PrefixedMetadataExtension.sol";

/**
 * @dev Extension to allow configuring tokens metadata URI.
 *      In this extension tokens will have a shared token URI prefix,
 *      therefore on tokenURI() token's ID will be appended to the base URI.
 *      It also allows configuring a fallback "placeholder" URI when prefix is not set yet.
 */
abstract contract ERC721APrefixedMetadataExtension is
    IERC721PrefixedMetadataExtension,
    Initializable,
    Ownable,
    ERC165Storage,
    ERC721A
{
    string internal _placeholderURI;
    string internal _baseTokenURI;

    bool public baseURIFrozen;

    function __ERC721APrefixedMetadataExtension_init(
        string memory placeholderURI_
    ) internal onlyInitializing {
        __ERC721APrefixedMetadataExtension_init_unchained(placeholderURI_);
    }

    function __ERC721APrefixedMetadataExtension_init_unchained(
        string memory placeholderURI_
    ) internal onlyInitializing {
        _placeholderURI = placeholderURI_;

        _registerInterface(type(IERC721PrefixedMetadataExtension).interfaceId);
        _registerInterface(type(IERC721Metadata).interfaceId);
    }

    /* ADMIN */

    function setPlaceholderURI(string memory newValue) external onlyOwner {
        _placeholderURI = newValue;
    }

    function setBaseURI(string memory newValue) external onlyOwner {
        require(!baseURIFrozen, "BASE_URI_FROZEN");
        _baseTokenURI = newValue;
    }

    function freezeBaseURI() external onlyOwner {
        baseURIFrozen = true;
    }

    /* PUBLIC */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, ERC721A)
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    function placeholderURI() public view returns (string memory) {
        return _placeholderURI;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A, IERC721PrefixedMetadataExtension)
        returns (string memory)
    {
        return
            bytes(_baseTokenURI).length > 0
                ? string(
                    abi.encodePacked(_baseTokenURI, Strings.toString(_tokenId))
                )
                : _placeholderURI;
    }
}
