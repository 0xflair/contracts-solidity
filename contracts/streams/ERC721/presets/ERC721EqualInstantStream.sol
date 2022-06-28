// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../extensions/ERC721InstantReleaseExtension.sol";
import "../extensions/ERC721EqualSplitExtension.sol";

contract ERC721EqualInstantStream is
    Initializable,
    OwnableUpgradeable,
    ERC721InstantReleaseExtension,
    ERC721EqualSplitExtension
{
    string public constant name = "ERC721 Equal Instant Stream";

    string public constant version = "0.1";

    struct Config {
        // Base
        address ticketToken;
        uint64 lockedUntilTimestamp;
        // Equal split extension
        uint256 totalTickets;
    }

    /* INTERNAL */

    constructor(Config memory config) {
        initialize(config);
    }

    function initialize(Config memory config) public initializer {
        __Context_init();
        __Ownable_init();
        __ERC721MultiTokenStream_init(
            config.ticketToken,
            config.lockedUntilTimestamp
        );
        __ERC721EqualSplitExtension_init(config.totalTickets);
    }
}
