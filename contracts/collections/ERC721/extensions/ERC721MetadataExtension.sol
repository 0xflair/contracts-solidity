// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Extension to allow configuring collection and tokens metadata URI.
 */
abstract contract ERC721MetadataExtension is Ownable, ERC721 {
    string private _contractURI;
    string private _placeholderURI;
    string private _baseTokenURI;
    bool private _baseURIFrozen;

    constructor(string memory contractURI_, string memory placeholderURI_) {
        _contractURI = contractURI_;
        _placeholderURI = placeholderURI_;
    }

    // ADMIN

    function setContractURI(string memory uri) external onlyOwner {
        _contractURI = uri;
    }

    function setPlaceholderURI(string memory placeholderURI)
        external
        onlyOwner
    {
        _placeholderURI = placeholderURI;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        require(!_baseURIFrozen, "BASE_URI_FROZEN");
        _baseTokenURI = baseURI;
    }

    function freezeBaseURI() external onlyOwner {
        _baseURIFrozen = true;
    }

    // PUBLIC

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
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
