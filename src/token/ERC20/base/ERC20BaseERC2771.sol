// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../../metatx/ERC2771ContextInternal.sol";

import "./ERC20Base.sol";

/**
 * @title Base ERC20 contract with meta-transactions support (via ERC2771).
 */
abstract contract ERC20BaseERC2771 is ERC20Base, ERC2771ContextInternal {
    function _msgSender() internal view virtual override(Context, ERC2771ContextInternal) returns (address) {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771ContextInternal) returns (bytes calldata) {
        return ERC2771ContextInternal._msgData();
    }
}
