// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../metatx/erc2771/ERC2771ContextInternal.sol";
import "./TieredSales.sol";

/**
 * @title Tiered Sales facet with meta-transactions support via ERC2771
 */
abstract contract TieredSalesERC2771 is TieredSales, ERC2771ContextInternal {
    function _msgSender() internal view override(Context, ERC2771ContextInternal) returns (address) {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771ContextInternal) returns (bytes calldata) {
        return ERC2771ContextInternal._msgData();
    }
}
