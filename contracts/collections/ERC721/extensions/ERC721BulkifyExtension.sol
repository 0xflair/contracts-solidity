// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Extension to add bulk operations to a standard ERC721 contract.
 */
abstract contract ERC721BulkifyExtension is Context, ERC721 {
    /**
     * Useful for when user wants to return tokens to get a refund,
     * or when they want to transfer lots of tokens by paying gas fee only once.
     */
    function transferFromBulk(
        address from,
        address to,
        uint256[] memory tokenIds
    ) public virtual {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_isApprovedOrOwner(_msgSender(), tokenIds[i]), "NOT_OWNER");
            _transfer(from, to, tokenIds[i]);
        }
    }
}
