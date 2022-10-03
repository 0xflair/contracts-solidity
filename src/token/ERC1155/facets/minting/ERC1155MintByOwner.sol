// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../common/Errors.sol";
import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/mintable/IERC1155Mintable.sol";
import "../../base/ERC1155BaseInternal.sol";
import "./IERC1155MintByOwner.sol";

/**
 * @title ERC1155 - Mint as Owner
 * @notice Allow minting as contract owner with no restrictions.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies 0xbb774d48
 * @custom:provides-interfaces 0x6c5e99c7
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

    /**
     * @inheritdoc IERC1155MintByOwner
     */
    function mintByOwner(
        address[] calldata tos,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes[] calldata datas
    ) public virtual onlyOwner {
        IERC1155Mintable(address(this)).mintByFacet(tos, ids, amounts, datas);
    }
}
