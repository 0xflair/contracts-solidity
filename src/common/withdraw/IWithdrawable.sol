// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.15;

interface IWithdrawable {
    enum Mode {
        OWNER,
        RECIPIENT,
        ANYONE,
        NOBODY
    }

    error WithdrawOnlyRecipient();
    error WithdrawOnlyOwner();
    error WithdrawImpossible();

    event Withdrawn(address[] claimTokens, uint256[] amounts);

    function withdraw(address[] calldata claimTokens, uint256[] calldata amounts) external;
}
