// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../../../misc/opensea/ProxyRegistry.sol";

/**
 * @dev Extension that automatically approves OpenSea proxy registry to avoid having users to "Approve" your collection before trading.
 *
 * Note this extension is built for Wyvern-based OpenSea contracts which means Ethereum chain.
 */
abstract contract ERC721OpenSeaNoGasWyvernExtension is Ownable, ERC721 {
    address internal _openSeaProxyRegistryAddress;

    constructor(address openSeaProxyRegistryAddress) {
        _openSeaProxyRegistryAddress = openSeaProxyRegistryAddress;
    }

    function setOpenSeaProxyRegistryAddress(address addr) external onlyOwner {
        _openSeaProxyRegistryAddress = addr;
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
        if (_openSeaProxyRegistryAddress != address(0)) {
            // Whitelist OpenSea proxy contract for easy trading.
            ProxyRegistry proxyRegistry = ProxyRegistry(
                _openSeaProxyRegistryAddress
            );

            if (address(proxyRegistry.proxies(owner)) == operator) {
                return true;
            }
        }

        return super.isApprovedForAll(owner, operator);
    }
}
