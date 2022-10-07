// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IERC721SupplyInternal.sol";

/**
 * @dev Extension of {ERC721} that tracks supply and defines a max supply cap.
 */
interface IERC721Supply is IERC721SupplyInternal {
    /**
     * @dev Total amount of tokens that exist in the collection.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Maximum amount of tokens possible to exist.
     */
    function maxSupply() external view returns (uint256);
}
