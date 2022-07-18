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

import "../base/ERC721MultiTokenStream.sol";

/**
 * @author Flair (https://flair.finance)
 */
interface IERC721LockedStakingExtension {
    function hasERC721LockedStakingExtension() external view returns (bool);

    function stake(uint256 tokenId) external;

    function stake(uint256[] calldata tokenIds) external;
}

abstract contract ERC721LockedStakingExtension is
    IERC721LockedStakingExtension,
    Initializable,
    ERC165Storage,
    Ownable,
    ERC721MultiTokenStream
{
    // Minimum seconds that token must be locked before unstaking.
    uint256 public minStakingLockTime;

    // Map of token ID to the time of last staking
    mapping(uint256 => uint64) public lastStakingTime;

    // Map of token ID to the sum total of all previous staked durations
    mapping(uint256 => uint64) public savedStakedDurations;

    /* INIT */

    function __ERC721LockedStakingExtension_init(uint64 _minStakingLockTime)
        internal
        onlyInitializing
    {
        __ERC721LockedStakingExtension_init_unchained(_minStakingLockTime);
    }

    function __ERC721LockedStakingExtension_init_unchained(
        uint64 _minStakingLockTime
    ) internal onlyInitializing {
        minStakingLockTime = _minStakingLockTime;

        _registerInterface(type(IERC721LockedStakingExtension).interfaceId);
    }

    /* ADMIN */

    function setMinLockTime(uint256 newValue) public onlyOwner {
        require(lockedUntilTimestamp < block.timestamp, "STREAM/CONFIG_LOCKED");
        minStakingLockTime = newValue;
    }

    /* PUBLIC */

    function hasERC721LockedStakingExtension() external pure returns (bool) {
        return true;
    }

    function stake(uint256 tokenId) public virtual {
        require(
            _msgSender() == IERC721(ticketToken).ownerOf(tokenId),
            "STREAM/NOT_TOKEN_OWNER"
        );

        lastStakingTime[tokenId] = uint64(block.timestamp);

        IERC721LockableExtension(ticketToken).lock(tokenId);
    }

    function stake(uint256[] calldata tokenIds) public virtual {
        address sender = _msgSender();
        uint64 currentTime = uint64(block.timestamp);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                sender == IERC721(ticketToken).ownerOf(tokenIds[i]),
                "STREAM/NOT_TOKEN_OWNER"
            );

            lastStakingTime[tokenIds[i]] = currentTime;
        }

        IERC721LockableExtension(ticketToken).lock(tokenIds);
    }

    function unstake(uint256 tokenId) public virtual {
        _unstake(_msgSender(), uint64(block.timestamp), tokenId);
        IERC721LockableExtension(ticketToken).unlock(tokenId);
    }

    function unstake(uint256[] calldata tokenIds) public virtual {
        address operator = _msgSender();
        uint64 currentTime = uint64(block.timestamp);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _unstake(operator, currentTime, tokenIds[i]);
        }

        IERC721LockableExtension(ticketToken).unlock(tokenIds);
    }

    function totalStakedDuration(uint256[] calldata ticketTokenIds)
        public
        view
        virtual
        returns (uint64)
    {
        uint64 totalDurations = 0;

        for (uint256 i = 0; i < ticketTokenIds.length; i++) {
            totalDurations += totalStakedDuration(ticketTokenIds[i]);
        }

        return totalDurations;
    }

    function totalStakedDuration(uint256 ticketTokenId)
        public
        view
        virtual
        returns (uint64)
    {
        uint64 total = savedStakedDurations[ticketTokenId];

        if (lastStakingTime[ticketTokenId] > 0) {
            uint64 targetTime = _stakingTimeLimit();

            if (targetTime > block.timestamp) {
                targetTime = uint64(block.timestamp);
            }

            if (lastStakingTime[ticketTokenId] > 0) {
                if (targetTime > lastStakingTime[ticketTokenId]) {
                    total += (targetTime - lastStakingTime[ticketTokenId]);
                }
            }
        }

        return total;
    }

    /* INTERNAL */

    function _stakingTimeLimit() internal view virtual returns (uint64) {
        return 18_446_744_073_709_551_615; // max(uint64)
    }

    function _unstake(
        address operator,
        uint64 currentTime,
        uint256 tokenId
    ) internal {
        require(lastStakingTime[tokenId] > 0, "STREAM/NOT_STAKED");

        require(
            currentTime >= lastStakingTime[tokenId] + minStakingLockTime,
            "STREAM/NOT_LOCKED_ENOUGH"
        );

        require(
            operator == IERC721(ticketToken).ownerOf(tokenId),
            "STREAM/NOT_TOKEN_OWNER"
        );

        savedStakedDurations[tokenId] = totalStakedDuration(tokenId);

        lastStakingTime[tokenId] = 0;
    }
}
