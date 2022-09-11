// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {ERC1155LockableInternal} from "./ERC1155LockableInternal.sol";

abstract contract ERC1155Lockable is ERC1155LockableInternal {
    function locked(address account, uint256 tokenId)
        public
        view
        virtual
        returns (uint256)
    {
        return super._locked(account, tokenId);
    }

    function locked(address account, uint256[] calldata ticketTokenIds)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory amounts = new uint256[](ticketTokenIds.length);

        for (uint256 i = 0; i < ticketTokenIds.length; i++) {
            amounts[i] = _locked(account, ticketTokenIds[i]);
        }

        return amounts;
    }
}
