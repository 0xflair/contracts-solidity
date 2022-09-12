// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../../../../finance/sales/TieredSalesStorage.sol";
import "../../../../finance/sales/TieredSales.sol";
import "../../extensions/mintable/IERC1155MintByFacet.sol";

/**
 * @title Sales mechanism for ERC1155 NFTs with multiple tiered pricing, allowlist and allocation plans.
 */
contract ERC1155TieredSales is ReentrancyGuard, TieredSales {
    using TieredSalesStorage for TieredSalesStorage.Layout;

    function mintByTier(
        uint256 tierId,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata proof
    ) external payable nonReentrant {
        super._executeSale(tierId, count, maxAllowance, proof);

        IERC1155MintByFacet(address(this)).mintByFacet(
            _msgSender(),
            TieredSalesStorage.layout().tiers[tierId].extra,
            count,
            ""
        );
    }
}
