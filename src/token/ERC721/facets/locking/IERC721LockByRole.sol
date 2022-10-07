// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC721} that allows grantee of LOCKER_ROLE to lock tokens.
 */
interface IERC721LockByRole {
    function lockByRole(uint256 id) external;

    function lockByRole(uint256[] calldata ids) external;
}
