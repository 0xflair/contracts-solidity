// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

interface ERC721SimpleProceedsExtensionInterface {
    function withdraw() external;
}

/**
 * @dev Extension to allow contract owner to withdraw all the funds directly.
 */
abstract contract ERC721SimpleProceedsExtension is
    Ownable,
    ERC165Storage,
    ERC721SimpleProceedsExtensionInterface
{
    constructor() {
        _registerInterface(
            type(ERC721SimpleProceedsExtensionInterface).interfaceId
        );
    }

    // ADMIN

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        payable(this.owner()).transfer(balance);
    }

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage)
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }
}
