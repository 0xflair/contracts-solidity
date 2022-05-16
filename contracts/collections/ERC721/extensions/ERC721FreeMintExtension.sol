// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "./ERC721AutoIdMinterExtension.sol";

interface ERC721FreeMintExtensionInterface is IERC165 {
    function mintFree(address to, uint256 count) external;
}

/**
 * @dev Extension to allow anyone to mint directly without paying.
 */
abstract contract ERC721FreeMintExtension is
    ERC721AutoIdMinterExtension,
    ERC721FreeMintExtensionInterface
{
    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721AutoIdMinterExtension)
        returns (bool)
    {
        return
            interfaceId == type(ERC721FreeMintExtensionInterface).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function mintFree(address to, uint256 count) external {
        _mintTo(to, count);
    }
}
