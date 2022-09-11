// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Supply.sol)

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../common/Errors.sol";
import "../base/ERC1155BaseInternal.sol";
import "../../../access/ownable/OwnableInternal.sol";

/**
 * @dev Extension of {ERC1155} that allows owner to mint new tokens.
 */
contract ERC1155MintByOwner is ERC1155BaseInternal, OwnableInternal {
    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must be diamond itself (other facets).
     */
    function mintByOwner(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual onlyOwner {
        _mint(to, id, amount, data);
    }
}
