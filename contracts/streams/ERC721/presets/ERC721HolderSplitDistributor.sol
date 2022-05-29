// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../core/ERC721BaseDistributor.sol";

contract ERC721HolderSplitDistributor is
    Ownable,
    Initializable,
    ERC721BaseDistributor
{
    using Address for address;
    using Address for address payable;

    string public constant name = "ERC721 Equal-share Distributor";

    string public constant version = "0.1";

    struct Config {
        address claimToken;
        address ticketToken;
    }

    /* INTERNAL */

    constructor(Config memory config) {
        initialize(msg.sender, config);
    }

    function initialize(address owner, Config memory config)
        public
        initializer
    {
        Ownable._transferOwnership(owner);
        ERC721BaseDistributor._setup(config.claimToken, config.ticketToken);
    }

    // PUBLIC

    function calculateClaimableAmount(uint256 ticketTokenId)
        public
        view
        override
        returns (uint256 claimableAmount)
    {
        claimableAmount = 0; // TODO implement
    }

    // INTERNAL

    function _beforeClaim(uint256 ticketTokenId) internal view override {
        // TODO implement
    }
}
