// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../extensions/ERC721EmissionReleaseExtension.sol";
import "../extensions/ERC721ShareSplitExtension.sol";

contract ERC721ShareEmissionStream is
    Initializable,
    OwnableUpgradeable,
    ERC721EmissionReleaseExtension,
    ERC721ShareSplitExtension
{
    using Address for address;
    using Address for address payable;

    string public constant name = "ERC721 Share Emission Stream";

    string public constant version = "0.1";

    struct Config {
        // Base
        address ticketToken;
        uint64 lockedUntilTimestamp;
        // Emission release extension
        uint256 emissionRate;
        uint64 emissionTimeUnit;
        uint64 emissionStart;
        uint64 emissionEnd;
        // Share split extension
        uint256[] tokenIds;
        uint256[] shares;
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
        __ERC721EmissionReleaseExtension_init(
            config.emissionRate,
            config.emissionTimeUnit,
            config.emissionStart,
            config.emissionEnd
        );
        __ERC721ShareSplitExtension_init(config.tokenIds, config.shares);
    }

    function _beforeClaim(uint256 ticketTokenId, address claimToken)
        internal
        view
        override(ERC721MultiTokenStream, ERC721EmissionReleaseExtension)
    {
        return
            ERC721EmissionReleaseExtension._beforeClaim(
                ticketTokenId,
                claimToken
            );
    }
}
