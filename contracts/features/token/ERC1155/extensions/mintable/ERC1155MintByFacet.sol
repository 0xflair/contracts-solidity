// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {SenderIsNotSelf} from "../../../../../common/Errors.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155MintByFacet.sol";

/**
 * @title Extension of {ERC1155} that allows other facets from the diamond to mint tokens.
 * @dev This variation is based on minimal base of ERC115, so there's no supply tracking or cap.
 */
contract ERC1155MintByFacet is IERC1155MintByFacet, ERC1155BaseInternal {
    /**
     * @inheritdoc IERC1155MintByFacet
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
