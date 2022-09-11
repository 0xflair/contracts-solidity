// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Supply.sol)

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../common/Errors.sol";
import "../IERC1155.sol";
import "../base/ERC1155BaseInternal.sol";

/**
 * @dev Extension of {ERC1155} that allows users or approved operators to burn tokens.
 */
contract ERC1155BurnByAccount is ERC1155BaseInternal {
    function burn(
        address account,
        uint256 id,
        uint256 value
    ) public virtual {
        require(
            account == _msgSender() ||
                IERC1155(address(this)).isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burn(account, id, value);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public virtual {
        require(
            account == _msgSender() ||
                IERC1155(address(this)).isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burnBatch(account, ids, values);
    }
}
