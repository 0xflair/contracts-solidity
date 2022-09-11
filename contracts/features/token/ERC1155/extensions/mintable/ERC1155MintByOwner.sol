// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155MintByOwner.sol";

/**
 * @dev Extension of {ERC1155} that allows owner to mint new tokens.
 */
contract ERC1155MintByOwner is
    IERC1155MintByOwner,
    ERC1155BaseInternal,
    OwnableInternal
{
    /**
     * @inheritdoc IERC1155MintByOwner
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
