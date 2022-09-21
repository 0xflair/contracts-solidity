// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/burnable/ERC1155BurnableStorage.sol";
import "./IERC1155BurnableAdmin.sol";

/**
 * @title ERC1155 - Burnable - Admin - Ownable
 * @notice Extension of ERC1155 to allow owner to manage burning mechanism.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xdc290004
 * @custom:provides-interfaces 0x710fb577
 */
contract ERC1155BurnableOwnable is IERC1155BurnableAdmin, OwnableInternal {
    using ERC1155BurnableStorage for ERC1155BurnableStorage.Layout;

    function setBurnablePausedUntil(uint256 newTimestamp) public onlyOwner {
        ERC1155BurnableStorage.layout().pausedUntil = newTimestamp;
    }
}
