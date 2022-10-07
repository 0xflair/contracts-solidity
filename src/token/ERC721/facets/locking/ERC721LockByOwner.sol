// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/lockable/IERC721Lockable.sol";
import "./IERC721LockByOwner.sol";

/**
 * @title ERC721 - Lock as Owner
 * @notice Allow locking tokens as the contract owner.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC721Lockable
 * @custom:provides-interfaces IERC721LockByOwner
 */
contract ERC721LockByOwner is IERC721LockByOwner, OwnableInternal {
    /**
     * @inheritdoc IERC721LockByOwner
     */
    function lockByOwner(uint256 id) public virtual onlyOwner {
        IERC721Lockable(address(this)).lockByFacet(id);
    }

    /**
     * @inheritdoc IERC721LockByOwner
     */
    function lockByOwner(uint256[] memory ids) public virtual onlyOwner {
        IERC721Lockable(address(this)).lockByFacet(ids);
    }
}
