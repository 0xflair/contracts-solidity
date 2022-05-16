// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "./ERC721AutoIdMinterExtension.sol";

interface ERC721OwnerMintExtensionInterface is IERC165 {
    function mintByOwner(address to, uint256 count) external;
}

/**
 * @dev Extension to allow owner to mint directly without paying.
 */
abstract contract ERC721OwnerMintExtension is
    Ownable,
    ERC721AutoIdMinterExtension,
    ERC721OwnerMintExtensionInterface
{
    // ADMIN

    function mintByOwner(address to, uint256 count) external onlyOwner {
        _mintTo(to, count);
    }

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721AutoIdMinterExtension)
        returns (bool)
    {
        return
            interfaceId ==
            type(ERC721OwnerMintExtensionInterface).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
