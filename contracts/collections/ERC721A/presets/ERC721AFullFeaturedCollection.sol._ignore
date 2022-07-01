// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../../../common/meta-transactions/ERC2771ContextOwnable.sol";
import "../../ERC721/extensions/ERC721CollectionMetadataExtension.sol";
import "../../ERC721/extensions/ERC721SimpleProceedsExtension.sol";
import "../../ERC721/extensions/ERC721RoyaltyExtension.sol";
import "../extensions/ERC721APrefixedMetadataExtension.sol";
import "../extensions/ERC721AMinterExtension.sol";
import "../extensions/ERC721AOwnerMintExtension.sol";
import "../extensions/ERC721APreSaleExtension.sol";
import "../extensions/ERC721APublicSaleExtension.sol";
import "../extensions/ERC721ARoleBasedMintExtension.sol";
import "../extensions/ERC721AOpenSeaNoGasExtension.sol";

contract ERC721AFullFeaturedCollection is
    Ownable,
    ERC165Storage,
    ERC721A,
    ERC2771ContextOwnable,
    ERC721CollectionMetadataExtension,
    ERC721APrefixedMetadataExtension,
    ERC721AMinterExtension,
    ERC721AOwnerMintExtension,
    ERC721APreSaleExtension,
    ERC721APublicSaleExtension,
    ERC721SimpleProceedsExtension,
    ERC721ARoleBasedMintExtension,
    ERC721RoyaltyExtension,
    ERC721AOpenSeaNoGasExtension
{
    struct Config {
        string name;
        string symbol;
        string contractURI;
        string placeholderURI;
        uint256 maxSupply;
        uint256 preSalePrice;
        uint256 preSaleMaxMintPerWallet;
        uint256 publicSalePrice;
        uint256 publicSaleMaxMintPerTx;
        address defaultRoyaltyAddress;
        uint16 defaultRoyaltyBps;
        address openSeaProxyRegistryAddress;
        address openSeaExchangeAddress;
        address trustedForwarder;
    }

    constructor(Config memory config)
        ERC721A(config.name, config.symbol)
        ERC721CollectionMetadataExtension(config.contractURI)
        ERC721APrefixedMetadataExtension(config.placeholderURI)
        ERC721AMinterExtension(config.maxSupply)
        ERC721APreSaleExtension(
            config.preSalePrice,
            config.preSaleMaxMintPerWallet
        )
        ERC721APublicSaleExtension(
            config.publicSalePrice,
            config.publicSaleMaxMintPerTx
        )
        ERC721RoyaltyExtension(
            config.defaultRoyaltyAddress,
            config.defaultRoyaltyBps
        )
        ERC721AOpenSeaNoGasExtension(
            config.openSeaProxyRegistryAddress,
            config.openSeaExchangeAddress
        )
        ERC2771ContextOwnable(config.trustedForwarder)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
    }

    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextOwnable, Context)
        returns (address sender)
    {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ERC2771ContextOwnable, Context)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /* PUBLIC */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(
            ERC165Storage,
            ERC721A,
            ERC721CollectionMetadataExtension,
            ERC721APrefixedMetadataExtension,
            ERC721AMinterExtension,
            ERC721APreSaleExtension,
            ERC721APublicSaleExtension,
            ERC721SimpleProceedsExtension,
            ERC721AOwnerMintExtension,
            ERC721ARoleBasedMintExtension,
            ERC721RoyaltyExtension,
            ERC721AOpenSeaNoGasExtension
        )
        returns (bool)
    {
        return ERC165Storage.supportsInterface(interfaceId);
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override(ERC721A, ERC721AOpenSeaNoGasExtension)
        returns (bool)
    {
        return super.isApprovedForAll(owner, operator);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A, ERC721APrefixedMetadataExtension)
        returns (string memory)
    {
        return ERC721APrefixedMetadataExtension.tokenURI(_tokenId);
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

        if (_msgSender() != address(0)) {
            balance = this.balanceOf(_msgSender());
        }

        return (
            maxSupply,
            this.totalSupply(),
            balance,
            preSalePrice,
            preSaleMaxMintPerWallet,
            preSaleAllowlistClaimed[_msgSender()],
            preSaleStatus,
            publicSalePrice,
            publicSaleMaxMintPerTx,
            publicSaleStatus
        );
    }
}
