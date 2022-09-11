// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface ITieredSales {
    struct Tier {
        uint256 start;
        uint256 end;
        address currency;
        uint256 price;
        uint256 maxPerWallet;
        bytes32 merkleRoot;
        uint256 reserved;
        uint256 maxAllocation;
        uint256 optionalAssetId;
    }

    function onTierAllowlist(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) external view returns (bool);

    function eligibleForTier(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) external view returns (uint256);

    function mintByTier(
        uint256 tierId,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) external payable;
}
