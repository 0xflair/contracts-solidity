// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IERC165.sol";
import "./ERC165Storage.sol";
import "../access/ownable/OwnableInternal.sol";

/**
 * @title ERC165 management facet using Ownable extension for access control
 */
contract ERC165Ownable is OwnableInternal {
    using ERC165Storage for ERC165Storage.Layout;

    /**
     * @param interfaceIds list of interface id to set as supported
     * @param interfaceIdsToRemove list of interface id to unset as supported
     */
    function setERC165(bytes4[] calldata interfaceIds, bytes4[] calldata interfaceIdsToRemove) public onlyOwner {
        ERC165Storage.Layout storage l = ERC165Storage.layout();

        l.supportedInterfaces[type(IERC165).interfaceId] = true;

        for (uint256 i = 0; i < interfaceIds.length; i++) {
            l.supportedInterfaces[interfaceIds[i]] = true;
        }

        for (uint256 i = 0; i < interfaceIdsToRemove.length; i++) {
            l.supportedInterfaces[interfaceIdsToRemove[i]] = false;
        }
    }
}
