// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../../metatx/erc2771/ERC2771ContextInternal.sol";

import "./ERC721ABase.sol";

/**
 * @title Base ERC721A contract with meta-transactions support (via ERC2771).
 */
abstract contract ERC721ABaseERC2771 is ERC721ABase, ERC2771ContextInternal {
    function _msgSender() internal view virtual override(Context, ERC2771ContextInternal) returns (address) {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771ContextInternal) returns (bytes calldata) {
        return ERC2771ContextInternal._msgData();
    }
}
