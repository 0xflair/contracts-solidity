// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./RoyaltyEnforcementStorage.sol";

abstract contract RoyaltyEnforcementAdminInternal {
    function _toggleRoyaltyEnforcement(bool enforce) internal virtual {
        RoyaltyEnforcementStorage.layout().enforceRoyalties = enforce;
    }
}
