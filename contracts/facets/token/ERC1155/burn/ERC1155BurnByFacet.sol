// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/extensions/ERC1155Supply.sol)

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../common/Errors.sol";
import "../base/ERC1155BaseInternal.sol";

/**
 * @dev Extension of {ERC1155} that allows other facets from the diamond to burn tokens.
 */
contract ERC1155BurnByFacet is ERC1155BaseInternal {
    function burnByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) public virtual {
        if (address(this) != msg.sender) {
            revert SenderIsNotSelf();
        }

        _burn(account, id, amount);
    }

    function burnBatchByFacet(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public virtual {
        if (address(this) != msg.sender) {
            revert SenderIsNotSelf();
        }

        _burnBatch(account, ids, values);
    }
}
