// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/lockable/IERC1155Lockable.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155LockByOwner.sol";

/**
 * @title ERC1155 - Lock as Owner
 * @notice Allow locking tokens as the contract owner.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC1155Lockable
 * @custom:provides-interfaces IERC1155LockByOwner
 */
contract ERC1155LockByOwner is IERC1155LockByOwner, OwnableInternal {
    /**
     * @inheritdoc IERC1155LockByOwner
     */
    function lockByOwner(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual onlyOwner {
        IERC1155Lockable(address(this)).lockByFacet(account, id, amount);
    }

    /**
     * @inheritdoc IERC1155LockByOwner
     */
    function lockByOwner(
        address[] memory accounts,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual onlyOwner {
        IERC1155Lockable(address(this)).lockByFacet(accounts, ids, amounts);
    }
}
