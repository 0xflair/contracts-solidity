// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../metatx/ERC2771ContextInternal.sol";
import "./ERC1155MintByOwner.sol";

/**
 * @dev Extension of {ERC1155} to mint as diamond owner with meta-transactions supported via ERC2771.
 */
contract ERC1155MintByOwnerERC2771 is ERC1155MintByOwner, ERC2771ContextInternal {
    function _msgSender() internal view virtual override(Context, ERC2771ContextInternal) returns (address) {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771ContextInternal) returns (bytes calldata) {
        return ERC2771ContextInternal._msgData();
    }
}
