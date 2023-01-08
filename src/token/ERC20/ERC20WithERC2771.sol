// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "./base/ERC20BaseERC2771.sol";
import "./extensions/supply/ERC20SupplyExtension.sol";
import "./extensions/mintable/ERC20MintableExtension.sol";
import "./extensions/burnable/ERC20BurnableExtension.sol";

/**
 * @title ERC20 - with meta-transactions
 * @notice Standard EIP-20 with ability to accept meta transactions (mainly transfer and approve methods).
 *
 * @custom:type eip-2535-facet
 * @custom:category Tokens
 * @custom:provides-interfaces IERC20 IERC20Base IERC20SupplyExtension IERC20MintableExtension
 */
contract ERC20WithERC2771 is ERC20BaseERC2771, ERC20SupplyExtension, ERC20MintableExtension {
    function _msgSender() internal view virtual override(Context, ERC20BaseERC2771) returns (address) {
        return ERC20BaseERC2771._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC20BaseERC2771) returns (bytes calldata) {
        return ERC20BaseERC2771._msgData();
    }

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20BaseInternal, ERC20SupplyExtension) {
        ERC20SupplyExtension._beforeTokenTransfer(from, to, amount);
    }
}
