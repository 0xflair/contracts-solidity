// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./base/ERC1155BaseERC2771.sol";
import "./extensions/supply/ERC1155Supply.sol";
import "./extensions/lockable/ERC1155Lockable.sol";
import "./extensions/mintable/ERC1155Mintable.sol";
import "./extensions/burnable/ERC1155Burnable.sol";

contract ERC1155WithERC2771 is ERC1155BaseERC2771, ERC1155Supply, ERC1155Mintable, ERC1155Burnable, ERC1155Lockable {
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155BaseInternal, ERC1155SupplyInternal, ERC1155LockableInternal) {
        ERC1155BaseInternal._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _msgSender() internal view virtual override(Context, ERC1155BaseERC2771) returns (address) {
        return ERC1155BaseERC2771._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC1155BaseERC2771) returns (bytes calldata) {
        return ERC1155BaseERC2771._msgData();
    }
}
