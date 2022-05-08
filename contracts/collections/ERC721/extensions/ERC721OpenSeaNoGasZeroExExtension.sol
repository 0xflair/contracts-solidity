// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @dev Extension that automatically approves OpenSea proxy registry to avoid having users to "Approve" your collection before trading.

 * Note this extension is built for ZeroEx-based OpenSea contracts which means Polygon chain.
 */
abstract contract ERC721OpenSeaNoGasZeroExExtension is Ownable, ERC721 {
    address private _openSeaExchangeAddress;

    constructor(address openSeaExchangeAddress) {
        _openSeaExchangeAddress = openSeaExchangeAddress;
    }

    function setOpenSeaExchangeAddress(address addr) external onlyOwner {
        _openSeaExchangeAddress = addr;
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        // If OpenSea's ERC721 exchange address is detected, auto-approve
        if (operator == address(_openSeaExchangeAddress)) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }
}
