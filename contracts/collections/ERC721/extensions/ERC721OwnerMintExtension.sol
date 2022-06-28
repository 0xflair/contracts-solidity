// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "./ERC721AutoIdMinterExtension.sol";

interface IERC721OwnerMintExtension {
    function mintByOwner(address to, uint256 count) external;
}

/**
 * @dev Extension to allow owner to mint directly without paying.
 */
abstract contract ERC721OwnerMintExtension is
    IERC721OwnerMintExtension,
    Ownable,
    ERC165Storage,
    ERC721AutoIdMinterExtension
{
    constructor() {
        _registerInterface(type(IERC721OwnerMintExtension).interfaceId);
    }

    /* ADMIN */

    function mintByOwner(address to, uint256 count) external onlyOwner {
        _mintTo(to, count);
    }

    /* PUBLIC */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, ERC721AutoIdMinterExtension)
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }
}
