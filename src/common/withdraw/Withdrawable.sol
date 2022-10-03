// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.15;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../../access/ownable/OwnableInternal.sol";
import "./WithdrawableStorage.sol";
import "./IWithdrawable.sol";

/**
 * @title Withdrawable
 * @notice Allow withdrwaing any ERC20 or native tokens from the contract.
 *
 * @custom:type eip-2535-facet
 * @custom:category Finance
 * @custom:provides-interfaces 0xde6d6d96
 */
contract Withdrawable is IWithdrawable, OwnableInternal {
    using WithdrawableStorage for WithdrawableStorage.Layout;

    using Address for address payable;

    function withdraw(address[] calldata claimTokens, uint256[] calldata amounts) external {
        WithdrawableStorage.Layout storage l = WithdrawableStorage.layout();

        /**
         * We are using msg.sender for smaller attack surface when evaluating
         * the sender of the function call. If in future we want to handle "withdraw"
         * functionality via meta transactions, we should consider using `_msgSender`
         */

        if (l.mode == IWithdrawable.Mode.NOBODY) {
            revert WithdrawImpossible();
        } else if (l.mode == IWithdrawable.Mode.RECIPIENT) {
            if (l.recipient != msg.sender) {
                revert WithdrawOnlyRecipient();
            }
        } else if (l.mode == IWithdrawable.Mode.OWNER) {
            if (_owner() != msg.sender) {
                revert WithdrawOnlyOwner();
            }
        }

        if (l.powerRevoked) {
            revert WithdrawImpossible();
        }

        for (uint256 i = 0; i < claimTokens.length; i++) {
            if (claimTokens[i] == address(0)) {
                payable(l.recipient).sendValue(amounts[i]);
            } else {
                IERC20(claimTokens[i]).transfer(address(l.recipient), amounts[i]);
            }
        }

        emit Withdrawn(claimTokens, amounts);
    }
}
