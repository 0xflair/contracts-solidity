// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../base/ERC1155Base.sol";
import "../extensions/supply/ERC1155Supply.sol";
import "../extensions/lockable/ERC1155Lockable.sol";
import "../extensions/mintable/ERC1155Mintable.sol";

contract ERC1155SupplyMintable is ERC1155Base, ERC1155Supply, ERC1155Mintable {
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155BaseInternal, ERC1155SupplyInternal) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
