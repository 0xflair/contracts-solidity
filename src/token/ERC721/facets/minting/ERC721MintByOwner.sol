// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/mintable/IERC721Mintable.sol";
import "./IERC721MintByOwner.sol";

/**
 * @title ERC721 - Mint as Owner
 * @notice Allow minting as contract owner with no restrictions (supports ERC721A).
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC721Mintable
 * @custom:provides-interfaces IERC721MintByOwner
 */
contract ERC721MintByOwner is IERC721MintByOwner, OwnableInternal {
    /**
     * @inheritdoc IERC721MintByOwner
     */
    function mintByOwner(address to, uint256 amount) public virtual onlyOwner {
        IERC721Mintable(address(this)).mintByFacet(to, amount);
    }

    /**
     * @inheritdoc IERC721MintByOwner
     */
    function mintByOwner(address[] calldata tos, uint256[] calldata amounts) public virtual onlyOwner {
        IERC721Mintable(address(this)).mintByFacet(tos, amounts);
    }
}
