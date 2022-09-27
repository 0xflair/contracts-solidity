// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "./ERC1155LockableInternal.sol";
import "./IERC1155Lockable.sol";

abstract contract ERC1155Lockable is IERC1155Lockable, ERC1155LockableInternal {
    function locked(address account, uint256 tokenId) public view virtual returns (uint256) {
        return super._locked(account, tokenId);
    }

    function locked(address account, uint256[] calldata ticketTokenIds) public view virtual returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](ticketTokenIds.length);

        for (uint256 i = 0; i < ticketTokenIds.length; i++) {
            amounts[i] = _locked(account, ticketTokenIds[i]);
        }

        return amounts;
    }

    /**
     * @inheritdoc IERC1155Lockable
     */
    function lockByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual override {
        if (address(this) != msg.sender) {
            revert SenderIsNotSelf();
        }

        _lock(account, id, amount);
    }

    /**
     * @inheritdoc IERC1155Lockable
     */
    function unlockByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual override {
        if (address(this) != msg.sender) {
            revert SenderIsNotSelf();
        }

        _unlock(account, id, amount);
    }
}
