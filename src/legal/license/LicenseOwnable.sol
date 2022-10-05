// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../access/ownable/OwnableInternal.sol";

import "./LicenseStorage.sol";
import "./LicenseInternal.sol";
import "./ILicenseAdmin.sol";

/**
 * @title License - Admin - Ownable
 * @notice Allow contract owner to manage license version, name and URI.
 *
 * @custom:type eip-2535-facet
 * @custom:category Legal
 * @custom:peer-dependencies 0xec3bb95b 0x649a51a8
 * @custom:provides-interfaces 0x06ff95be
 */
contract LicenseOwnable is ILicenseAdmin, OwnableInternal, LicenseInternal {
    using LicenseStorage for LicenseStorage.Layout;

    function setLicenseVersion(LicenseVersion licenseVersion) external override onlyOwner {
        _setLicenseVersion(licenseVersion);
    }

    function lockLicenseVersion() external override onlyOwner {
        _lockLicenseVersion();
    }

    function licenseVersionLocked() external view override returns (bool) {
        return LicenseStorage.layout().licenseVersionLocked;
    }
}
