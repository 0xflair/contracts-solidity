// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/roles/AccessControlInternal.sol";
import "../../extensions/mintable/IERC721Mintable.sol";
import "./IERC721MintByRole.sol";

/**
 * @title ERC721 - Mint as Role
 * @notice Allow minting for senders with MINTER_ROLE to mint new tokens (supports ERC721A).
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies IERC721Mintable
 * @custom:provides-interfaces IERC721MintByRole
 */
contract ERC721MintByRole is IERC721MintByRole, AccessControlInternal {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @inheritdoc IERC721MintByRole
     */
    function mintByRole(address to, uint256 amount) public virtual onlyRole(MINTER_ROLE) {
        IERC721Mintable(address(this)).mintByFacet(to, amount);
    }

    /**
     * @inheritdoc IERC721MintByRole
     */
    function mintByRole(address[] calldata tos, uint256[] calldata amounts) public virtual onlyRole(MINTER_ROLE) {
        IERC721Mintable(address(this)).mintByFacet(tos, amounts);
    }
}
