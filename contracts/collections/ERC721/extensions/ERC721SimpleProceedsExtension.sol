// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface ERC721SimpleProceedsExtensionInterface is IERC165 {
    function withdraw() external;
}

/**
 * @dev Extension to allow contract owner to withdraw all the funds directly.
 */
abstract contract ERC721SimpleProceedsExtension is
    Ownable,
    ERC721SimpleProceedsExtensionInterface
{
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
        override(IERC165)
        returns (bool)
    {
        return
            interfaceId ==
            type(ERC721SimpleProceedsExtensionInterface).interfaceId;
    }
}
