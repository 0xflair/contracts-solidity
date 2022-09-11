// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Supply.sol)

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../common/Errors.sol";
import "../base/ERC1155BaseInternal.sol";

/**
 * @dev Extension of {ERC1155} that allows other facets from the diamond to mint tokens.
 */
contract ERC1155MintByFacet is ERC1155BaseInternal {
    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must be diamond itself (other facets).
     */
    function mintByFacet(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual {
        if (address(this) != msg.sender) {
            revert SenderIsNotSelf();
        }

        _mint(to, id, amount, data);
    }
}
