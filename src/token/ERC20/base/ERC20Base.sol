// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import { IERC20Base } from "./IERC20Base.sol";
import { ERC20BaseInternal } from "./ERC20BaseInternal.sol";
import { ERC20BaseStorage } from "./ERC20BaseStorage.sol";

/**
 * @title Base ERC20 implementation, excluding optional extensions
 */
abstract contract ERC20Base is IERC20Base, ERC20BaseInternal {
    /**
     * @inheritdoc IERC20Base
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply();
    }

    /**
     * @inheritdoc IERC20Base
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balanceOf(account);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function allowance(address holder, address spender) public view virtual returns (uint256) {
        return _allowance(holder, spender);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        return _approve(_msgSender(), spender, amount);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {
        return _transfer(_msgSender(), recipient, amount);
    }

    /**
     * @inheritdoc IERC20Base
     */
    function transferFrom(
        address holder,
        address recipient,
        uint256 amount
    ) public virtual returns (bool) {
        return _transferFrom(holder, recipient, amount);
    }
}
