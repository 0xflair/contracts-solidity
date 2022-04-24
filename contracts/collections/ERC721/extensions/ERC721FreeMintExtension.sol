// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC721AutoIdMinterExtension.sol";

/**
 * @dev Extension to allow anyone to mint directly without paying.
 */
abstract contract ERC721FreeMintExtension is ERC721AutoIdMinterExtension {
    // PUBLIC

    function mintFree(address to, uint256 count) external {
        _mintTo(to, count);
    }
}
