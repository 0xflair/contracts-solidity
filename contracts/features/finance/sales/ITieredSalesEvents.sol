// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

interface ITieredSalesEvents {
    struct Tier {
        uint256 start;
        uint256 end;
        address currency;
        uint256 price;
        uint256 maxPerWallet;
        bytes32 merkleRoot;
        uint256 reserved;
        uint256 maxAllocation;
        uint256 assetId;
    }
}
