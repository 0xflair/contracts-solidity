// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

/**
 * @dev Extension of {ERC20} that allows holders or approved operators to burn tokens.
 */
interface IERC20BurnableExtension {
    function burn(uint256 amount) external;

    function burnByFacet(address account, uint256 id) external;
}
