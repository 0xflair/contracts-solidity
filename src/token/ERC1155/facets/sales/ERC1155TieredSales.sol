// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../../../../introspection/ERC165Storage.sol";
import "../../../../finance/sales/TieredSales.sol";
import "../../extensions/mintable/IERC1155Mintable.sol";
import "../../extensions/supply/ERC1155SupplyStorage.sol";
import "../../extensions/supply/IERC1155Supply.sol";
import "./ERC1155TieredSalesStorage.sol";
import "./IERC1155TieredSales.sol";

/**
 * @title ERC1155 - Tiered Sales
 * @notice Sales mechanism for ERC1155 NFTs with multiple tiered pricing, allowlist and allocation plans.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:required-dependencies eip165:0xb164884b
 * @custom:provides-interfaces 0x79f33254 0x5ae18a74
 */
contract ERC1155TieredSales is IERC1155TieredSales, ReentrancyGuard, TieredSales {
    using ERC165Storage for ERC165Storage.Layout;
    using ERC1155TieredSalesStorage for ERC1155TieredSalesStorage.Layout;
    using ERC1155SupplyStorage for ERC1155SupplyStorage.Layout;

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

    function tierToTokenId(uint256 tierId) external view returns (uint256) {
        return ERC1155TieredSalesStorage.layout().tierToTokenId[tierId];
    }

    function tierToTokenId(uint256[] calldata tierIds) external view returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](tierIds.length);

        for (uint256 i = 0; i < tierIds.length; i++) {
            tokenIds[i] = ERC1155TieredSalesStorage.layout().tierToTokenId[tierIds[i]];
        }

        return tokenIds;
    }

    function _remainingSupplyForTier(uint256 tierId) internal view override returns (uint256) {
        if (!ERC165Storage.layout().supportedInterfaces[type(IERC1155Supply).interfaceId]) {
            return type(uint256).max;
        }

        uint256 tokenId = ERC1155TieredSalesStorage.layout().tierToTokenId[tierId];

        uint256 remainingSupply = ERC1155SupplyStorage.layout().maxSupply[tokenId] -
            ERC1155SupplyStorage.layout().totalSupply[tokenId];

        return remainingSupply;
    }
}
