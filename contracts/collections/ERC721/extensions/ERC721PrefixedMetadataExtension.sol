// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Extension to allow configuring collection and tokens metadata URI.
 *      In this extension tokens will have a shared token URI prefix,
 *      therefore on tokenURI() token's ID will be appended to the base URI.
 */
abstract contract ERC721PrefixedMetadataExtension is Ownable, ERC721 {
    string private _contractURI;
    string private _placeholderURI;
    string private _baseTokenURI;
    bool private _baseURIFrozen;

    constructor(string memory contractURI_, string memory placeholderURI_) {
        _contractURI = contractURI_;
        _placeholderURI = placeholderURI_;
    }

    // ADMIN

    function setContractURI(string memory newValue) external onlyOwner {
        _contractURI = newValue;
    }

    function setPlaceholderURI(string memory newValue) external onlyOwner {
        _placeholderURI = newValue;
    }

    function setBaseURI(string memory newValue) external onlyOwner {
        require(!_baseURIFrozen, "BASE_URI_FROZEN");
        _baseTokenURI = newValue;
    }

    function freezeBaseURI() external onlyOwner {
        _baseURIFrozen = true;
    }

    // PUBLIC

    function contractURI() public view returns (string memory) {
        return _contractURI;
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
