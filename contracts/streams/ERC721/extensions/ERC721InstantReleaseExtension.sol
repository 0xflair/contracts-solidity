// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../base/ERC721MultiTokenStream.sol";

interface IERC721InstantReleaseExtension {
    function hasERC721InstantReleaseExtension() external view returns (bool);
}

abstract contract ERC721InstantReleaseExtension is
    IERC721InstantReleaseExtension,
    Initializable,
    ERC165Storage,
    OwnableUpgradeable,
    ERC721MultiTokenStream
{
    /* INIT */

    function __ERC721InstantReleaseExtension_init() internal onlyInitializing {
        __Context_init();
        __ERC721InstantReleaseExtension_init_unchained();
    }

    function __ERC721InstantReleaseExtension_init_unchained()
        internal
        onlyInitializing
    {
        _registerInterface(type(IERC721InstantReleaseExtension).interfaceId);
    }

    /* PUBLIC */

    function hasERC721InstantReleaseExtension() external pure returns (bool) {
        return true;
    }

    /* INTERNAL */

    function _totalReleasedAmount(
        uint256 streamTotalSupply_,
        uint256 ticketTokenId_,
        address claimToken_
    ) internal pure override returns (uint256) {
        ticketTokenId_;
        claimToken_;

        return streamTotalSupply_;
    }
}
