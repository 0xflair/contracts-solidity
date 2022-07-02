// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../extensions/ERC721VestingReleaseExtension.sol";
import "../extensions/ERC721EqualSplitExtension.sol";

contract ERC721EqualVestingStream is
    Initializable,
    Ownable,
    ERC721VestingReleaseExtension,
    ERC721EqualSplitExtension
{
    using Address for address;
    using Address for address payable;

    string public constant name = "ERC721 Equal Vesting Stream";

    string public constant version = "0.1";

    struct Config {
        // Base
        address ticketToken;
        uint64 lockedUntilTimestamp;
        // Vesting release extension
        uint64 startTimestamp;
        uint64 durationSeconds;
        // Equal split extension
        uint256 totalTickets;
    }

    /* INTERNAL */

    constructor(Config memory config) {
        initialize(config, msg.sender);
    }

    function initialize(Config memory config, address deployer)
        public
        initializer
    {
        _transferOwnership(deployer);
        __ERC721MultiTokenStream_init(
            config.ticketToken,
            config.lockedUntilTimestamp
        );
        __ERC721VestingReleaseExtension_init(
            config.startTimestamp,
            config.durationSeconds
        );
        __ERC721EqualSplitExtension_init(config.totalTickets);
    }
}
