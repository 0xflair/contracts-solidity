// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/mintable/IERC1155Mintable.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155MintByOwner.sol";

/**
 * @dev Extension of {ERC1155} that allows owner to mint new tokens.
 */
contract ERC1155MintByOwner is IERC1155MintByOwner, OwnableInternal {
    /**
     * @inheritdoc IERC1155MintByOwner
     */
    function mintByOwner(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual onlyOwner {
        IERC1155Mintable(address(this)).mintByFacet(to, id, amount, data);
    }
}
