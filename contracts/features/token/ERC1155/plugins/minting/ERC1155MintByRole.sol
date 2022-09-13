// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../../common/Errors.sol";
import "../../../../access/roles/AccessControlInternal.sol";
import "../../extensions/mintable/IERC1155Mintable.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155MintByRole.sol";

/**
 * @dev Extension of {ERC1155} that allows senders with MINTER_ROLE to mint new tokens.
 */
contract ERC1155MintByRole is IERC1155MintByRole, AccessControlInternal {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @inheritdoc IERC1155MintByRole
     */
    function mintByRole(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) {
        IERC1155Mintable(address(this)).mintByFacet(to, id, amount, data);
    }
}
