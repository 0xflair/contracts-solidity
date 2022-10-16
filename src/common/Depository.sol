// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../access/ownable/Ownable.sol";
import "../access/roles/AccessControl.sol";
import "../finance/withdraw/Withdrawable.sol";

contract Depository is ReentrancyGuard, Ownable, AccessControl, Withdrawable {
    using Address for address payable;

    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

    constructor() {
        _transferOwnership(msg.sender);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DEPOSITOR_ROLE, msg.sender);
    }

    function depositNative(address wallet, uint256 amount) public payable onlyRole(DEPOSITOR_ROLE) nonReentrant {
        payable(wallet).sendValue(amount);
    }

    function depositNative(address[] calldata wallets, uint256[] calldata amounts)
        public
        payable
        onlyRole(DEPOSITOR_ROLE)
        nonReentrant
    {
        require(wallets.length == amounts.length, "Depository: invalid length");

        for (uint256 i = 0; i < wallets.length; i++) {
            payable(wallets[i]).sendValue(amounts[i]);
        }
    }

    function depositERC20(
        address token,
        address wallet,
        uint256 amount
    ) public payable onlyRole(DEPOSITOR_ROLE) nonReentrant {
        IERC20(token).transfer(address(wallet), amount);
    }

    function depositERC20(
        address[] calldata tokens,
        address[] calldata wallets,
        uint256[] calldata amounts
    ) public payable onlyRole(DEPOSITOR_ROLE) nonReentrant {
        require(wallets.length == amounts.length, "Depository: invalid length");
        require(wallets.length == tokens.length, "Depository: invalid length");

        for (uint256 i = 0; i < wallets.length; i++) {
            IERC20(tokens[i]).transfer(address(wallets[i]), amounts[i]);
        }
    }
}
