// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./ERC721AutoIdMinterExtension.sol";

/**
 * @dev Extension to provide pre-sale and public-sale capabilities for colelctors to mint for a specific price.
 */
abstract contract ERC721PublicSalesExtension is
    Ownable,
    ERC721AutoIdMinterExtension,
    ReentrancyGuard
{
    uint256 public publicSalePrice;
    uint256 public publicSaleMaxMintPerTx;
    bool public publicSaleActive;

    constructor(uint256 _publicSalePrice, uint256 _publicSaleMaxMintPerTx) {
        publicSalePrice = _publicSalePrice;
        publicSaleMaxMintPerTx = _publicSaleMaxMintPerTx;
    }

    function togglePublicSale(bool isActive) external onlyOwner {
        publicSaleActive = isActive;
    }

    function mintPublic(address to, uint256 count)
        external
        payable
        nonReentrant
    {
        require(publicSaleActive, "PRE_SALE_NOT_ACTIVE");
        require(count <= publicSaleMaxMintPerTx, "PUBLIC_SALE_LIMIT");
        require(publicSalePrice * count <= msg.value, "INSUFFICIENT_AMOUNT");

        _mintTo(to, count);
    }
}
