// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../access/ownable/OwnableInternal.sol";

import "./WithdrawableStorage.sol";
import "./IWithdrawableAdmin.sol";

/**
 * @title Withdrawable - Admin - Ownable
 * @notice Allow contract owner to manage who can withdraw funds and how.
 *
 * @custom:type eip-2535-facet
 * @custom:category Finance
 * @custom:peer-dependencies 0xde6d6d96
 * @custom:provides-interfaces 0x7246cea5
 */
contract WithdrawableOwnable is IWithdrawableAdmin, OwnableInternal {
    using WithdrawableStorage for WithdrawableStorage.Layout;

    function setWithdrawRecipient(address _recipient) external override onlyOwner {
        if (WithdrawableStorage.layout().recipientLocked) {
            revert WithdrawRecipientLocked();
        }

        WithdrawableStorage.layout().recipient = _recipient;
    }

    function lockWithdrawRecipient() external override onlyOwner {
        WithdrawableStorage.layout().recipientLocked = true;
    }

    function revokeWithdrawPower() external override onlyOwner {
        WithdrawableStorage.layout().powerRevoked = true;
    }

    function setWithdrawMode(IWithdrawable.Mode _mode) external override onlyOwner {
        if (WithdrawableStorage.layout().modeLocked) {
            revert WithdrawModeLocked();
        }

        WithdrawableStorage.layout().mode = _mode;
    }

    function lockWithdrawMode() external override onlyOwner {
        WithdrawableStorage.layout().modeLocked = true;
    }
}
