// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC721} that tracks supply and defines a max supply cap.
 */
interface IERC721SupplyExtension {
    error ErrMaxSupplyExceeded();
}
