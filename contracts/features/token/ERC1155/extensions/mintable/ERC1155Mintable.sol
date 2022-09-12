// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./ERC1155MintByFacet.sol";
import "./ERC1155MintByOwner.sol";

/**
 * @title Extension of {ERC1155} that has all core minting extensions for convenience.
 */
contract ERC1155Mintable is ERC1155MintByFacet, ERC1155MintByOwner {

}
