// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/roles/AccessControlInternal.sol";
import "../../extensions/lockable/IERC721Lockable.sol";
import "./IERC721LockByRole.sol";

/**
 * @title ERC721 - Lock as Role
 * @notice Allow locking tokens by any sender who has the LOCKER_ROLE.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC721Lockable
 * @custom:provides-interfaces IERC721LockByRole
 */
contract ERC721LockByRole is IERC721LockByRole, AccessControlInternal {
    bytes32 public constant LOCKER_ROLE = keccak256("LOCKER_ROLE");

    /**
     * @inheritdoc IERC721LockByRole
     */
    function lockByRole(uint256 id) external virtual onlyRole(LOCKER_ROLE) {
        IERC721Lockable(address(this)).lockByFacet(id);
    }

    /**
     * @inheritdoc IERC721LockByRole
     */
    function lockByRole(uint256[] memory ids) external virtual onlyRole(LOCKER_ROLE) {
        IERC721Lockable(address(this)).lockByFacet(ids);
    }
}
