// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../../access/ownable/OwnableInternal.sol";

import "./RoyaltyEnforcementStorage.sol";
import "./IRoyaltyEnforcement.sol";

abstract contract RoyaltyEnforcement is IRoyaltyEnforcement, OwnableInternal {
    function royaltiesEnforced() external view virtual override returns (bool) {
        return RoyaltyEnforcementStorage.layout().enforceRoyalties;
    }
}
