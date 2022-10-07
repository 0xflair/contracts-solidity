// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./base/ERC721ABaseERC2771.sol";
import "./extensions/supply/ERC721ASupply.sol";
import "./extensions/lockable/ERC721ALockable.sol";
import "./extensions/mintable/ERC721AMintable.sol";
import "./extensions/burnable/ERC721ABurnable.sol";

/**
 * @title ERC721 (A) - With ERC2771 Context
 * @notice Azuki's implemntation of standard EIP-721 with ability to accept meta transactions (mainly transfer or burn methods).
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:provides-interfaces IERC721 IERC721ABase IERC721Supply IERC721Mintable IERC721Lockable IERC721Burnable
 */
contract ERC721AWithERC2771 is ERC721ABaseERC2771, ERC721ASupply, ERC721AMintable, ERC721ABurnable, ERC721ALockable {
    /**
     * @dev See {ERC721A-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721ABaseInternal, ERC721ALockableInternal, ERC721ASupplyInternal) {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
    }

    function _msgSender() internal view virtual override(Context, ERC721ABaseERC2771) returns (address) {
        return ERC721ABaseERC2771._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC721ABaseERC2771) returns (bytes calldata) {
        return ERC721ABaseERC2771._msgData();
    }

    /**
     * @dev See {ERC721A-_totalSupply}.
     */
    function totalSupply() external view virtual override(ERC721ABase, IERC721Supply) returns (uint256) {
        return ERC721ABaseInternal._totalSupply();
    }
}
