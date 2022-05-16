// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "./ERC721AutoIdMinterExtension.sol";

interface ERC721RoleBasedMintExtensionInterface is IERC165 {
    function mintByRole(address to, uint256 count) external;
}

/**
 * @dev Extension to allow holders of a OpenZepplin-based role to mint directly.
 */
abstract contract ERC721RoleBasedMintExtension is
    ERC721AutoIdMinterExtension,
    AccessControl,
    ERC721RoleBasedMintExtensionInterface
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    function mintByRole(address to, uint256 count) external {
        require(hasRole(MINTER_ROLE, _msgSender()), "NOT_MINTER_ROLE");

        _mintTo(to, count);
    }

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, AccessControl, ERC721AutoIdMinterExtension)
        returns (bool)
    {
        return
            interfaceId ==
            type(ERC721RoleBasedMintExtensionInterface).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
