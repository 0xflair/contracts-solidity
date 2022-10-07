// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

import "./ERC721ASupplyInternal.sol";
import "./IERC721Supply.sol";

abstract contract ERC721ASupply is IERC721Supply, ERC721ASupplyInternal {
    function maxSupply() external view override returns (uint256) {
        return _maxSupply();
    }
}
