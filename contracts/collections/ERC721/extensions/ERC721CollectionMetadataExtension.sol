// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IERC721CollectionMetadataExtension {
    function setContractURI(string memory newValue) external;

    function contractURI() external view returns (string memory);
}

/**
 * @dev Extension to allow configuring contract-level collection metadata URI.
 */
abstract contract ERC721CollectionMetadataExtension is
    IERC721CollectionMetadataExtension,
    Ownable,
    ERC165Storage
{
    string private _contractURI;

    constructor(string memory contractURI_) {
        _registerInterface(
            type(IERC721CollectionMetadataExtension).interfaceId
        );
        _registerInterface(type(IERC721Metadata).interfaceId);

        _contractURI = contractURI_;
    }

    /* ADMIN */

    function setContractURI(string memory newValue) external onlyOwner {
        _contractURI = newValue;
    }

    /* PUBLIC */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage)
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}
