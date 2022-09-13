// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../../../../access/ownable/OwnableInternal.sol";
import "../../extensions/burnable/ERC1155BurnableStorage.sol";

/**
 * @dev Extension of ERC1155 to allow owner to manage burning mechanism.
 */
contract ERC1155BurnableOwnable is OwnableInternal {
    using ERC1155BurnableStorage for ERC1155BurnableStorage.Layout;

    function setPausedUntil(uint256 newValue) public onlyOwner {
        ERC1155BurnableStorage.layout().pausedUntil = newValue;
    }
}
