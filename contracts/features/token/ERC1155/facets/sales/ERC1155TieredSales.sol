// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../../../../finance/sales/TieredSales.sol";
import "../../extensions/mintable/IERC1155Mintable.sol";
import "./ERC1155TieredSalesStorage.sol";

/**
 * @title Sales mechanism for ERC1155 NFTs with multiple tiered pricing, allowlist and allocation plans.
 */
contract ERC1155TieredSales is ReentrancyGuard, TieredSales {
    using ERC1155TieredSalesStorage for ERC1155TieredSalesStorage.Layout;

    function mintByTier(
        uint256 tierId,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) external payable nonReentrant {
        super._executeSale(tierId, count, maxAllowance, proof);

        IERC1155Mintable(address(this)).mintByFacet(
            _msgSender(),
            ERC1155TieredSalesStorage.layout().tierToTokenId[tierId],
            count,
            ""
        );
    }
}
