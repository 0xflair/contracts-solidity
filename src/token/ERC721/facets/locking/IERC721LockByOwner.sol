// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC721} that allows diamond owner to lock tokens.
 */
interface IERC721LockByOwner {
    function lockByOwner(uint256 id) external;

    function lockByOwner(uint256[] calldata ids) external;
}
