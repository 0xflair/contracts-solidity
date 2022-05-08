// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Extension to allow contract owner to withdraw all the funds directly.
 */
abstract contract ERC721SimpleProceedsExtension is Ownable {
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        payable(this.owner()).transfer(balance);
    }
}
