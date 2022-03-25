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

contract ERC721SimpleRoyaltyCollection is
    Ownable,
    ERC721,
    ERC721MetadataExtension,
    ERC721AutoIdMinterExtension,
    ERC721OwnerMintExtension,
    ERC721PreSalesExtension,
    ERC721PublicSalesExtension,
    ERC721RoyaltyExtension,
    ERC721SimpleProceedsExtension
{
    constructor(
        string memory name,
        string memory symbol,
        string memory contractURI,
        string memory placeholderURI,
        // Merged interger arguments due to Solifity limitations:
        //
        // uint256 maxSupply,
        // uint256 preSalePrice,
        // uint256 preSaleMaxMintPerWallet,
        // uint256 publicSalePrice,
        // uint256 publicSaleMaxMintPerTx,
        uint256[] memory uints,
        address raribleRoyaltyAddress
    )
        ERC721(name, symbol)
        ERC721MetadataExtension(contractURI, placeholderURI)
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
        ERC721RoyaltyExtension(raribleRoyaltyAddress)
    {}

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721RoyaltyExtension)
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
