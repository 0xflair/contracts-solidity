// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

interface IERC721SimpleProceedsExtension {
    function setProceedsRecipient(address _proceedsRecipient) external;

    function lockProceedsRecipient() external;

    function withdraw() external;
}

/**
 * @dev Extension to allow contract owner to withdraw all the funds directly.
 */
abstract contract ERC721SimpleProceedsExtension is
    IERC721SimpleProceedsExtension,
    Ownable,
    ERC165Storage
{
    address public proceedsRecipient;
    bool public proceedsRecipientLocked;

    constructor() {
        _registerInterface(type(IERC721SimpleProceedsExtension).interfaceId);

        proceedsRecipient = _msgSender();
    }

    /* ADMIN */

    function setProceedsRecipient(address _proceedsRecipient)
        external
        onlyOwner
    {
        require(!proceedsRecipientLocked, "ERC721/RECIPIENT_LOCKED");
        proceedsRecipient = _proceedsRecipient;
    }

    function lockProceedsRecipient() external onlyOwner {
        require(!proceedsRecipientLocked, "ERC721/RECIPIENT_LOCKED");
        proceedsRecipientLocked = true;
    }

    function withdraw() external {
        require(proceedsRecipient != address(0), "ERC721/NO_RECIPIENT");

        uint256 balance = address(this).balance;

        payable(proceedsRecipient).transfer(balance);
    }

    /* PUBLIC */

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
