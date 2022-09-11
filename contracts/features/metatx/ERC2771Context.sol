// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {ERC2771ContextStorage} from "./ERC2771ContextStorage.sol";
import {ERC2771ContextInternal} from "./ERC2771ContextInternal.sol";
import {OwnableInternal} from "../access/ownable/OwnableInternal.sol";

contract ERC2771Context is ERC2771ContextInternal, OwnableInternal {
    function setTrustedForwarder(address trustedForwarder) public onlyOwner {
        ERC2771ContextStorage.layout().trustedForwarder = trustedForwarder;
    }

    function isTrustedForwarder(address forwarder)
        public
        view
        virtual
        returns (bool)
    {
        return _isTrustedForwarder(forwarder);
    }
}
