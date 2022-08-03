// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {IERC721LockableExtension} from "../../../collections/ERC721/extensions/ERC721LockableExtension.sol";

import "./ERC721StakingExtension.sol";

/**
 * @author Flair (https://flair.finance)
 */
interface IERC721CustodialStakingExtension {
    function hasERC721CustodialStakingExtension() external view returns (bool);
}

/**
 * @author Flair (https://flair.finance)
 */
abstract contract ERC721CustodialStakingExtension is
    IERC721CustodialStakingExtension,
    ERC721StakingExtension
{
    mapping(uint256 => address) public stakers;

    /* INIT */

    function __ERC721CustodialStakingExtension_init(
        uint64 _minStakingDuration,
        uint64 _maxStakingTotalDurations
    ) internal onlyInitializing {
        __ERC721CustodialStakingExtension_init_unchained();
        __ERC721StakingExtension_init_unchained(
            _minStakingDuration,
            _maxStakingTotalDurations
        );
    }

    function __ERC721CustodialStakingExtension_init_unchained()
        internal
        onlyInitializing
    {
        _registerInterface(type(IERC721CustodialStakingExtension).interfaceId);
    }

    /* PUBLIC */

    function hasERC721CustodialStakingExtension() external pure returns (bool) {
        return true;
    }

    function stake(uint256 tokenId) public virtual override {
        super.stake(tokenId);

        address staker = _msgSender();

        stakers[tokenId] = staker;
        IERC721(ticketToken).transferFrom(staker, address(this), tokenId);
    }

    function stake(uint256[] calldata tokenIds) public virtual override {
        super.stake(tokenIds);

        address staker = _msgSender();
        for (uint256 i; i < tokenIds.length; i++) {
            stakers[tokenIds[i]] = staker;
            IERC721(ticketToken).transferFrom(
                staker,
                address(this),
                tokenIds[i]
            );
        }
    }

    function unstake(uint256 tokenId) public virtual override {
        super.unstake(tokenId);

        address staker = _msgSender();

        require(stakers[tokenId] == staker, "NOT_STAKER");

        IERC721(ticketToken).transferFrom(address(this), staker, tokenId);
    }

    function unstake(uint256[] calldata tokenIds) public virtual override {
        super.stake(tokenIds);
        address staker = _msgSender();

        for (uint256 i; i < tokenIds.length; i++) {
            require(stakers[tokenIds[i]] == staker, "NOT_STAKER");

            IERC721(ticketToken).transferFrom(
                address(this),
                staker,
                tokenIds[i]
            );
        }
    }
}
