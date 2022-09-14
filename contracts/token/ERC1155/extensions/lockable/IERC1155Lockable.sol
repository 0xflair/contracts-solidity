// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} that allows other facets from the diamond to lock the tokens.
 */
interface IERC1155Lockable {
    /**
     * @dev Locks `amount` of tokens of `account`, of token type `id`.
     *
     * Requirements:
     *
     * - the caller must be diamond itself (other facets).
     */
    function lockByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    /**
     * @dev Un-locks `amount` of tokens of `account`, of token type `id`.
     *
     * Requirements:
     *
     * - the caller must be diamond itself (other facets).
     */
    function unlockByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) external;
}
