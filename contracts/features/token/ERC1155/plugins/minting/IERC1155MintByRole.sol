// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} that allows a specific role to mint tokens.
 */
interface IERC1155MintByRole {
    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have MINTER_ROLE.
     */
    function mintByRole(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;
}
