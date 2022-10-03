// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../metatx/ERC2771ContextInternal.sol";
import "./ERC1155MintByOwner.sol";

/**
 * @title ERC1155 - Mint as Owner - With ERC2771 Context
 * @notice Allow minting as owner via meta transactions (signed by the owner private key)
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies 0xbb774d48
 * @custom:provides-interfaces 0x6c5e99c7
 */
contract ERC1155MintByOwnerERC2771 is ERC1155MintByOwner, ERC2771ContextInternal {
    function _msgSender() internal view virtual override(Context, ERC2771ContextInternal) returns (address) {
        return ERC2771ContextInternal._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771ContextInternal) returns (bytes calldata) {
        return ERC2771ContextInternal._msgData();
    }
}
