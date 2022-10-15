// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./AccessControlInternal.sol";
import "./IAccessControl.sol";

abstract contract AccessControl is AccessControlInternal, IAccessControl {
    function versionIAccessControl() external pure virtual returns (string memory) {
        return "2.x";
    }

    function grantRole(bytes32 role, address account) public virtual override onlyRole(_getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual onlyRole(_getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address account) public virtual override {
        _renounceRole(role, account);
    }

    function getRoleAdmin(bytes32 role) public view virtual override returns (bytes32) {
        return _getRoleAdmin(role);
    }
}
