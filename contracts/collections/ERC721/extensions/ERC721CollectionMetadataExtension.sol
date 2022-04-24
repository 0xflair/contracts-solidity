// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Extension to allow configuring contract-level collection metadata URI.
 */
abstract contract ERC721CollectionMetadataExtension is Ownable {
    string private _contractURI;

    constructor(string memory contractURI_) {
        _contractURI = contractURI_;
    }

    // ADMIN

    function setContractURI(string memory newValue) external onlyOwner {
        _contractURI = newValue;
    }

    // PUBLIC

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}
