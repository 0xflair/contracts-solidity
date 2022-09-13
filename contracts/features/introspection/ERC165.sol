// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "./IERC165.sol";
import "./ERC165Storage.sol";

/**
 * @title ERC165 implementation
 */
contract ERC165 is IERC165 {
    using ERC165Storage for ERC165Storage.Layout;

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId) public view returns (bool) {
        return ERC165Storage.layout().isSupportedInterface(interfaceId);
    }
}
