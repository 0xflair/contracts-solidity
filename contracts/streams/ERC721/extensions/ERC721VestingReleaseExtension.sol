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

import "../base/ERC721MultiTokenStream.sol";

interface IERC721VestingReleaseExtension {
    function hasERC721VestingReleaseExtension() external view returns (bool);

    function setVestingStartTimestamp(uint64 newValue) external;

    function setVestingDurationSeconds(uint64 newValue) external;
}

abstract contract ERC721VestingReleaseExtension is
    IERC721VestingReleaseExtension,
    Initializable,
    ERC165Storage,
    Ownable,
    ERC721MultiTokenStream
{
    // Start of the vesting schedule
    uint64 public vestingStartTimestamp;

    // Duration of the vesting schedule
    uint64 public vestingDurationSeconds;

    /* INTERNAL */

    function __ERC721VestingReleaseExtension_init(
        uint64 _vestingStartTimestamp,
        uint64 _vestingDurationSeconds
    ) internal onlyInitializing {
        __ERC721VestingReleaseExtension_init_unchained(
            _vestingStartTimestamp,
            _vestingDurationSeconds
        );
    }

    function __ERC721VestingReleaseExtension_init_unchained(
        uint64 _vestingStartTimestamp,
        uint64 _vestingDurationSeconds
    ) internal onlyInitializing {
        vestingStartTimestamp = _vestingStartTimestamp;
        vestingDurationSeconds = _vestingDurationSeconds;

        _registerInterface(type(IERC721VestingReleaseExtension).interfaceId);
    }

    /* ADMIN */

    function setVestingStartTimestamp(uint64 newValue) public onlyOwner {
        require(lockedUntilTimestamp < block.timestamp, "STREAM/CONFIG_LOCKED");
        vestingStartTimestamp = newValue;
    }

    function setVestingDurationSeconds(uint64 newValue) public onlyOwner {
        require(lockedUntilTimestamp < block.timestamp, "STREAM/CONFIG_LOCKED");
        vestingDurationSeconds = newValue;
    }

    /* PUBLIC */

    function hasERC721VestingReleaseExtension() external pure returns (bool) {
        return true;
    }

    /* INTERNAL */

    function _totalStreamReleasedAmount(
        uint256 _streamTotalSupply,
        uint256 _ticketTokenId,
        address _claimToken
    ) internal view override returns (uint256) {
        _ticketTokenId;
        _claimToken;

        if (block.timestamp < vestingStartTimestamp) {
            return 0;
        } else if (
            block.timestamp > vestingStartTimestamp + vestingDurationSeconds
        ) {
            return _streamTotalSupply;
        } else {
            return
                (_streamTotalSupply *
                    (block.timestamp - vestingStartTimestamp)) /
                vestingDurationSeconds;
        }
    }
}
