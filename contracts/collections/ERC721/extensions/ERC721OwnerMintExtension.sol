// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC721AutoIdMinterExtension.sol";

/**
 * @dev Extension to allow owner to mint directly without paying.
 */
abstract contract ERC721OwnerMintExtension is
    Ownable,
    ERC721AutoIdMinterExtension
{
    // ADMIN

    function mintOwner(address to, uint256 count) external onlyOwner {
        _mintTo(to, count);
    }
}
