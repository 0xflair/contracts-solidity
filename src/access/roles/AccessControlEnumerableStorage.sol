// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library AccessControlEnumerableStorage {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Layout {
        mapping(bytes32 => EnumerableSet.AddressSet) roleMembers;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256("openzeppelin.contracts.storage.AccessControlEnumerable");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
