// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./base/ERC1155Base.sol";
import "./extensions/supply/ERC1155Supply.sol";
import "./extensions/lockable/ERC1155Lockable.sol";
import "./extensions/mintable/ERC1155Mintable.sol";
import "./extensions/burnable/ERC1155Burnable.sol";

/**
 * @title ERC1155 - Standard
 * @notice Standard EIP-1155 NFTs with core capabilities of Mintable, Burnable and Lockable.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:provides-interfaces 0xd9b67a26 0x744f4bd4 0x813a0876 0xdc290004 0xff3508c6 0xb164884b
 */
contract ERC1155 is ERC1155Base, ERC1155Supply, ERC1155Mintable, ERC1155Burnable, ERC1155Lockable {
    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155BaseInternal, ERC1155SupplyInternal, ERC1155LockableInternal) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
