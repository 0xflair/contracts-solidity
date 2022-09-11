// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {ERC1155BaseInternal} from "../../base/ERC1155BaseInternal.sol";
import {ERC1155LockableStorage} from "./ERC1155LockableStorage.sol";

abstract contract ERC1155LockableInternal is ERC1155BaseInternal {
    using ERC1155LockableStorage for ERC1155LockableStorage.Layout;

    function _locked(address account, uint256 tokenId)
        internal
        view
        virtual
        returns (uint256)
    {
        mapping(uint256 => uint256) storage locks = ERC1155LockableStorage
            .layout()
            .lockedAmount[account];

        return locks[tokenId];
    }

    /* INTERNAL */

    function _lock(uint256 tokenId, uint256 amount) internal virtual {
        mapping(uint256 => uint256) storage locks = ERC1155LockableStorage
            .layout()
            .lockedAmount[_msgSender()];

        require(
            _balanceOf(_msgSender(), tokenId) - locks[tokenId] >= amount,
            "NOT_ENOUGH_BALANCE"
        );

        locks[tokenId] += amount;
    }

    function _unlock(uint256 tokenId, uint256 amount) internal virtual {
        mapping(uint256 => uint256) storage locks = ERC1155LockableStorage
            .layout()
            .lockedAmount[_msgSender()];

        require(locks[tokenId] >= amount, "NOT_ENOUGH_LOCKED");

        locks[tokenId] -= amount;
    }

    /**
     * @dev See {ERC1155-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                _balanceOf(from, ids[i]) -
                    ERC1155LockableStorage.layout().lockedAmount[from][
                        ids[i]
                    ] >=
                    amounts[i],
                "LOCKED"
            );
        }

        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
