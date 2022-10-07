// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/roles/AccessControlInternal.sol";
import "../../extensions/lockable/IERC1155Lockable.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155LockByRole.sol";

/**
 * @title ERC1155 - Lock as Role
 * @notice Allow locking tokens by any sender who has the LOCKER_ROLE.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC1155Lockable
 * @custom:provides-interfaces IERC1155LockByRole
 */
contract ERC1155LockByRole is IERC1155LockByRole, AccessControlInternal {
    bytes32 public constant LOCKER_ROLE = keccak256("LOCKER_ROLE");

    /**
     * @inheritdoc IERC1155LockByRole
     */
    function lockByRole(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual onlyRole(LOCKER_ROLE) {
        IERC1155Lockable(address(this)).lockByFacet(account, id, amount);
    }

    /**
     * @inheritdoc IERC1155LockByRole
     */
    function lockByRole(
        address[] memory accounts,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual onlyRole(LOCKER_ROLE) {
        IERC1155Lockable(address(this)).lockByFacet(accounts, ids, amounts);
    }
}
