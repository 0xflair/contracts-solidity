// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../../../../common/Errors.sol";
import "../../base/ERC20BaseInternal.sol";
import "./IERC20BurnableExtension.sol";

/**
 * @title Extension of {ERC20} that allows users or approved operators to burn tokens.
 */
abstract contract ERC20BurnableExtension is IERC20BurnableExtension, ERC20BaseInternal {
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Burn from another facet, allow skipping of ownership check as facets are trusted.
     */
    function burnByFacet(address account, uint256 amount) public virtual {
        if (address(this) != msg.sender) {
            revert ErrSenderIsNotSelf();
        }

        _burn(account, amount);
    }
}
