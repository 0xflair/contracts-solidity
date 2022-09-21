// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../access/ownable/OwnableInternal.sol";
import "./ERC2771ContextStorage.sol";
import "./IERC2771ContextAdmin.sol";

contract ERC2771ContextOwnable is IERC2771ContextAdmin, OwnableInternal {
    function setTrustedForwarder(address trustedForwarder) public onlyOwner {
        ERC2771ContextStorage.layout().trustedForwarder = trustedForwarder;
    }
}
