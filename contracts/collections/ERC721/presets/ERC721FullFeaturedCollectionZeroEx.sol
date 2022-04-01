// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../extensions/ERC721MetadataExtension.sol";
import "../extensions/ERC721AutoIdMinterExtension.sol";
import "../extensions/ERC721OwnerMintExtension.sol";
import "../extensions/ERC721PreSalesExtension.sol";
import "../extensions/ERC721PublicSalesExtension.sol";
import "../extensions/ERC721RoyaltyExtension.sol";
import "../extensions/ERC721SimpleProceedsExtension.sol";
import "../extensions/ERC721RoleBasedMintExtension.sol";
import "../extensions/ERC721BulkifyExtension.sol";
import "../extensions/ERC721OpenSeaNoGasZeroExExtension.sol";

/**
 * This contract has all the features, plus it offers gasless listing for OpenSea on Polygon chains.
 */
contract ERC721FullFeaturedCollectionZeroEx is
    Ownable,
    ERC721,
    ERC721MetadataExtension,
    ERC721AutoIdMinterExtension,
    ERC721OwnerMintExtension,
    ERC721PreSalesExtension,
    ERC721PublicSalesExtension,
    ERC721RoyaltyExtension,
    ERC721SimpleProceedsExtension,
    ERC721RoleBasedMintExtension,
    ERC721BulkifyExtension,
    ERC721OpenSeaNoGasZeroExExtension
{
    constructor(
        string memory name,
        string memory symbol,
        string memory contractURI,
        string memory placeholderURI,
        address raribleRoyaltyAddress,
        address openSeaExchangeAddress,
        // Merged interger arguments due to Solifity limitations:
        //
        // uint256 maxSupply,
        // uint256 preSalePrice,
        // uint256 preSaleMaxMintPerWallet,
        // uint256 publicSalePrice,
        // uint256 publicSaleMaxMintPerTx,
        uint256[5] memory uints
    )
        ERC721(name, symbol)
        ERC721MetadataExtension(contractURI, placeholderURI)
        ERC721RoyaltyExtension(
            raribleRoyaltyAddress
        )
        ERC721OpenSeaNoGasZeroExExtension(
            openSeaExchangeAddress
        )
        ERC721AutoIdMinterExtension(
            uints[0] /* maxSupply */
        )
        ERC721PreSalesExtension(
            uints[1], /* preSalePrice */
            uints[2] /* preSaleMaxMintPerWallet */
        )
        ERC721PublicSalesExtension(
            uints[3], /* publicSalePrice */
            uints[4] /* publicSaleMaxMintPerTx */
        )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    // PUBLIC

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override(
            ERC721,
            ERC721OpenSeaNoGasZeroExExtension
        )
        returns (bool)
    {
        return super.isApprovedForAll(owner, operator);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721RoleBasedMintExtension, ERC721RoyaltyExtension)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721, ERC721MetadataExtension)
        returns (string memory)
    {
        return ERC721MetadataExtension.tokenURI(_tokenId);
    }

    function getInfo()
        external
        view
        returns (
            uint256 _maxSupply,
            uint256 _totalSupply,
            uint256 _senderBalance,
            uint256 _preSalePrice,
            uint256 _preSaleMaxMintPerWallet,
            uint256 _preSaleAlreadyClaimed,
            bool _preSaleActive,
            uint256 _publicSalePrice,
            uint256 _publicSaleMaxMintPerTx,
            bool _publicSaleActive
        )
    {
        uint256 balance = 0;

        if (msg.sender != address(0)) {
            balance = this.balanceOf(msg.sender);
        }

        return (
            maxSupply,
            this.totalSupply(),
            balance,
            preSalePrice,
            preSaleMaxMintPerWallet,
            preSaleAllowlistClaimed[msg.sender],
            preSaleActive,
            publicSalePrice,
            publicSaleMaxMintPerTx,
            publicSaleActive
        );
    }
}
