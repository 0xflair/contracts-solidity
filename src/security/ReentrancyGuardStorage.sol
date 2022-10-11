// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

library ReentrancyGuardStorage {
    struct Layout {
        uint256 _status;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256("v2.flair.contracts.storage.ReentrancyGuard");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
