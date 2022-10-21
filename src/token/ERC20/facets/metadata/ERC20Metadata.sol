// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import { Metadata } from "../../../common/metadata/Metadata.sol";
import { IERC20Metadata } from "./IERC20Metadata.sol";
import { ERC20MetadataInternal } from "./ERC20MetadataInternal.sol";

/**
 * @title ERC20 metadata extensions
 */
abstract contract ERC20Metadata is Metadata, IERC20Metadata, ERC20MetadataInternal {
    /**
     * @inheritdoc IERC20Metadata
     */
    function decimals() external view returns (uint8) {
        return _decimals();
    }
}
