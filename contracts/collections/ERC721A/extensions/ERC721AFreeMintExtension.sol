// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "./ERC721AMinterExtension.sol";

import {IERC721FreeMintExtension} from "../../ERC721/extensions/ERC721FreeMintExtension.sol";

/**
 * @dev Extension to allow anyone to mint directly without paying.
 */
abstract contract ERC721AFreeMintExtension is
    IERC721FreeMintExtension,
    Initializable,
    ERC165Storage,
    ERC721AMinterExtension
{
    function __ERC721AFreeMintExtension_init() internal onlyInitializing {
        __ERC721AFreeMintExtension_init_unchained();
    }

    function __ERC721AFreeMintExtension_init_unchained()
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
        override(ERC165Storage, ERC721AMinterExtension)
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    function mintFree(address to, uint256 count) external {
        _mintTo(to, count);
    }
}
