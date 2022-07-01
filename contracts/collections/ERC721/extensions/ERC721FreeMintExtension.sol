// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "./ERC721AutoIdMinterExtension.sol";

interface IERC721FreeMintExtension {
    function mintFree(address to, uint256 count) external;
}

/**
 * @dev Extension to allow anyone to mint directly without paying.
 */
abstract contract ERC721FreeMintExtension is
    IERC721FreeMintExtension,
    Initializable,
    ERC165Storage,
    ERC721AutoIdMinterExtension
{
    function __ERC721FreeMintExtension_init() internal onlyInitializing {
        __ERC721FreeMintExtension_init_unchained();
    }

    function __ERC721FreeMintExtension_init_unchained()
        internal
        onlyInitializing
    {
        _registerInterface(type(IERC721FreeMintExtension).interfaceId);
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

    function mintFree(address to, uint256 count) external {
        _mintTo(to, count);
    }
}
