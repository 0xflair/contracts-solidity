// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface ERC721CollectionMetadataExtensionInterface is IERC165 {
    function setContractURI(string memory newValue) external;

    function contractURI() external view returns (string memory);
}

/**
 * @dev Extension to allow configuring contract-level collection metadata URI.
 */
abstract contract ERC721CollectionMetadataExtension is
    Ownable,
    ERC721CollectionMetadataExtensionInterface
{
    string private _contractURI;

    constructor(string memory contractURI_) {
        _contractURI = contractURI_;
    }

    // ADMIN

    function setContractURI(string memory newValue) external onlyOwner {
        _contractURI = newValue;
    }

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165)
        returns (bool)
    {
        return
            interfaceId ==
            type(ERC721CollectionMetadataExtensionInterface).interfaceId;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}
