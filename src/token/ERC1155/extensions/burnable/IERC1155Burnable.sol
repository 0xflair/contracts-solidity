// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @dev Extension of {ERC1155} that allows holders or approved operators to burn tokens.
 */
interface IERC1155Burnable {
    function burnablePausedUntil() external view returns (uint256);

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) external;

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) external;

    function burnByFacet(
        address account,
        uint256 id,
        uint256 amount
    ) external;

    function burnBatchByFacet(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) external;
}
