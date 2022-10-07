// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} that allows grantee of LOCKER_ROLE to lock tokens.
 */
interface IERC1155LockByRole {
    function lockByRole(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function lockByRole(
        address[] calldata accounts,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external;
}
