// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../extensions/ERC721MetadataExtension.sol";
import "../extensions/ERC721AutoIdMinterExtension.sol";
import "../extensions/ERC721OwnerMintExtension.sol";

contract ERC721SimpleCollection is
    Ownable,
    ERC721,
    ERC721MetadataExtension,
    ERC721AutoIdMinterExtension,
    ERC721OwnerMintExtension
{
    constructor(
        string memory name,
        string memory symbol,
        string memory contractURI,
        string memory placeholderURI,
        uint256 maxSupply
    )
        ERC721(name, symbol)
        ERC721MetadataExtension(contractURI, placeholderURI)
        ERC721AutoIdMinterExtension(maxSupply)
    {}

    // PUBLIC

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
            uint256 _senderBalance
        )
    {
        uint256 balance = 0;

        if (msg.sender != address(0)) {
            balance = this.balanceOf(msg.sender);
        }

        return (maxSupply, this.totalSupply(), balance);
    }
}
