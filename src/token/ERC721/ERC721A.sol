// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./base/ERC721ABase.sol";

import "./extensions/supply/ERC721ASupply.sol";
import "./extensions/mintable/ERC721AMintable.sol";
import "./extensions/lockable/ERC721ALockable.sol";
import "./extensions/burnable/ERC721ABurnable.sol";

/**
 * @title ERC721 (A) - Standard
 * @notice Azuki's implementation of standard EIP-721 NFTs with core capabilities of Mintable, Burnable and Lockable.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:provides-interfaces IERC721 IERC721ABase IERC721Supply IERC721Mintable IERC721Lockable IERC721Burnable
 */
contract ERC721A is ERC721ABase, ERC721ASupply, ERC721AMintable, ERC721ALockable, ERC721ABurnable {
    /**
     * @dev See {ERC721A-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721ABaseInternal, ERC721ASupplyInternal, ERC721ALockableInternal) {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    /**
     * @dev See {ERC721A-_totalSupply}.
     */
    function totalSupply() external view virtual override(ERC721ABase, IERC721Supply) returns (uint256) {
        return ERC721ABaseInternal._totalSupply();
    }
}
