// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {ERC1155Base, ERC1155BaseInternal} from "../base/ERC1155Base.sol";
import {ERC1155Supply, ERC1155SupplyInternal} from "../extensions/supply/ERC1155Supply.sol";
import {ERC1155MintByFacet} from "../extensions/mintable/ERC1155MintByFacet.sol";
import {ERC1155MintByOwner} from "../extensions/mintable/ERC1155MintByOwner.sol";

contract ERC1155SupplyMintable is
    ERC1155Base,
    ERC1155Supply,
    ERC1155MintByFacet,
    ERC1155MintByOwner
{
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
