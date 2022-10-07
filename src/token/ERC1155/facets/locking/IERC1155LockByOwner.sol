// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} that allows diamond owner to lock tokens.
 */
interface IERC1155LockByOwner {
    function lockByOwner(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function lockByOwner(
        address[] calldata accounts,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external;
}
