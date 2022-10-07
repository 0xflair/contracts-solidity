// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../access/ownable/OwnableInternal.sol";
import "./BurnableStorage.sol";
import "./IBurnableAdmin.sol";

/**
 * @title Burnable - Admin - Ownable
 * @notice Allow contract owner to manage burning mechanism.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:peer-dependencies 0xdc290004
 * @custom:provides-interfaces 0x710fb577
 */
contract BurnableOwnable is IBurnableAdmin, OwnableInternal {
    using BurnableStorage for BurnableStorage.Layout;

    function setBurnablePausedUntil(uint256 newTimestamp) public virtual onlyOwner {
        BurnableStorage.layout().pausedUntil = newTimestamp;
    }
}
