// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {ERC2771ContextStorage} from "./ERC2771ContextStorage.sol";
import {ERC2771ContextInternal} from "./ERC2771ContextInternal.sol";

contract ERC2771Context is ERC2771ContextInternal {
    using ERC2771ContextStorage for ERC2771ContextStorage.Layout;

    function isTrustedForwarder(address forwarder)
        public
        view
        virtual
        returns (bool)
    {
        return _isTrustedForwarder(forwarder);
    }
}
