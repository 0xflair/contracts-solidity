// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {OwnableStorage} from "./OwnableStorage.sol";
import {IERC173Event} from "./IERC173Event.sol";

abstract contract OwnableInternal is IERC173Event {
    using OwnableStorage for OwnableStorage.Layout;

    modifier onlyOwner() {
        require(msg.sender == _owner(), "Ownable: sender must be owner");
        _;
    }

    function _owner() internal view virtual returns (address) {
        return OwnableStorage.layout().owner;
    }

    function _transferOwnership(address account) internal virtual {
        OwnableStorage.layout().setOwner(account);
        emit OwnershipTransferred(msg.sender, account);
    }
}
