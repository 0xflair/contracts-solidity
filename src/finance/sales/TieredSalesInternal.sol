// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./ITieredSalesInternal.sol";
import "./TieredSalesStorage.sol";

import "../../access/ownable/OwnableInternal.sol";

/**
 * @title Sales mechanism for NFTs with multiple tiered pricing, allowlist and allocation plans
 */
abstract contract TieredSalesInternal is ITieredSalesInternal, Context, OwnableInternal {
    using ECDSA for bytes32;
    using TieredSalesStorage for TieredSalesStorage.Layout;

    function _configureTiering(uint256 tierId, Tier calldata tier) internal virtual {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        require(tier.maxAllocation >= l.tierMints[tierId], "LOWER_THAN_MINTED");

        if (l.tiers[tierId].reserved > 0) {
            require(tier.reserved >= l.tierMints[tierId], "LOW_RESERVE_AMOUNT");
        }

        if (l.tierMints[tierId] > 0) {
            require(tier.maxPerWallet >= l.tiers[tierId].maxPerWallet, "LOW_MAX_PER_WALLET");
        }

        l.totalReserved -= l.tiers[tierId].reserved;
        l.tiers[tierId] = tier;
        l.totalReserved += tier.reserved;
    }

    function _configureTiering(uint256[] calldata _tierIds, Tier[] calldata _tiers) internal virtual {
        for (uint256 i = 0; i < _tierIds.length; i++) {
            _configureTiering(_tierIds[i], _tiers[i]);
        }
    }

    function _onTierAllowlist(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes32[] calldata allowlistProof
    ) internal view virtual returns (bool) {
        return
            MerkleProof.verify(
                allowlistProof,
                TieredSalesStorage.layout().tiers[tierId].merkleRoot,
                _generateMerkleLeaf(minter, maxAllowance)
            );
    }

    function _verifySignature(
        address signer,
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        bytes calldata signature,
        uint256 validUntil
    ) internal view virtual returns (bool) {
        if (validUntil < block.timestamp) {
            return false;
        }

        address recoveredSignerAddr = _typeHashTierTicket(tierId, minter, maxAllowance, validUntil).recover(signature);

        return recoveredSignerAddr == signer;
    }

    function _maxMintableForTier(
        uint256 tierId,
        address minter,
        uint256 maxAllowance
    ) internal view virtual returns (uint256 maxMintable) {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        require(l.tiers[tierId].maxPerWallet > 0, "NOT_EXISTS");
        require(block.timestamp >= l.tiers[tierId].start, "NOT_STARTED");
        require(block.timestamp <= l.tiers[tierId].end, "ALREADY_ENDED");

        maxMintable = l.tiers[tierId].maxPerWallet - l.walletMinted[tierId][minter];

        require(l.walletMinted[tierId][minter] < maxAllowance, "MAXED_ALLOWANCE");

        uint256 remainingAllowance = maxAllowance - l.walletMinted[tierId][minter];

        if (maxMintable > remainingAllowance) {
            maxMintable = remainingAllowance;
        }
    }

    function _availableSupplyForTier(uint256 tierId) internal view virtual returns (uint256 remaining) {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        // Substract all the remaining reserved spots from the total remaining supply...
        remaining = _remainingSupply(tierId) - (l.totalReserved - l.reservedMints);

        // If this tier has reserved spots, add remaining spots back to result...
        if (l.tiers[tierId].reserved > 0) {
            remaining += (l.tiers[tierId].reserved - l.tierMints[tierId]);
        }
    }

    function _executeSale(
        uint256 tierId,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata allowlistProof,
        bytes calldata signature,
        uint256 validUntil
    ) internal virtual {
        _validateTier(tierId, _msgSender(), count, maxAllowance, allowlistProof, signature, validUntil);

        {
            TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

            if (l.tiers[tierId].currency == address(0)) {
                require(l.tiers[tierId].price * count <= msg.value, "INSUFFICIENT_AMOUNT");
            } else {
                IERC20(l.tiers[tierId].currency).transferFrom(
                    _msgSender(),
                    address(this),
                    l.tiers[tierId].price * count
                );
            }

            l.walletMinted[tierId][_msgSender()] += count;
            l.tierMints[tierId] += count;

            if (l.tiers[tierId].reserved > 0) {
                l.reservedMints += count;
            }
        }
    }

    function _validateTier(
        uint256 tierId,
        address minter,
        uint256 count,
        uint256 maxAllowance,
        bytes32[] calldata allowlistProof,
        bytes calldata signature,
        uint256 validUntil
    ) internal view virtual {
        TieredSalesStorage.Layout storage l = TieredSalesStorage.layout();

        uint256 maxMintable = _maxMintableForTier(tierId, minter, maxAllowance);

        require(count <= maxMintable, "EXCEEDS_MAX");
        require(count <= _availableSupplyForTier(tierId), "EXCEEDS_SUPPLY");
        require(count + l.tierMints[tierId] <= l.tiers[tierId].maxAllocation, "EXCEEDS_ALLOCATION");

        if (l.tiers[tierId].merkleRoot != bytes32(0)) {
            require(_onTierAllowlist(tierId, minter, maxAllowance, allowlistProof), "NOT_ALLOWLISTED");
        }

        if (l.tiers[tierId].signer != address(0)) {
            require(
                _verifySignature(l.tiers[tierId].signer, tierId, minter, maxAllowance, signature, validUntil),
                "INVALID_SIGNATURE"
            );
        }
    }

    function _remainingSupply(
        uint256 /*tierId*/
    ) internal view virtual returns (uint256) {
        // By default assume supply is unlimited (that means reserving allocation for tiers is irrelevant)
        return type(uint256).max;
    }

    /* PRIVATE */

    function _generateMerkleLeaf(address account, uint256 maxAllowance) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(account, maxAllowance));
    }

    function _typeHashTierTicket(
        uint256 tierId,
        address minter,
        uint256 maxAllowance,
        uint256 validUntil
    ) internal view returns (bytes32) {
        /* Per EIP 712. */
        bytes32 structHash = keccak256(
            abi.encode(TieredSalesStorage.TIER_TICKET_TYPEHASH, tierId, minter, maxAllowance, validUntil)
        );

        return ECDSA.toTypedDataHash(_tieredSalesDomainSeparator(), structHash);
    }

    /**
     * @notice return the EIP-712 domain separator unique to contract and chain
     * @return domainSeparator domain separator
     */
    function _tieredSalesDomainSeparator() internal view returns (bytes32 domainSeparator) {
        domainSeparator = TieredSalesStorage.layout().domainSeparators[_chainId()];

        if (domainSeparator == 0x00) {
            domainSeparator = _calculateDomainSeparator();
        }
    }

    function _calculateDomainSeparator() private view returns (bytes32 domainSeparator) {
        // no need for assembly, running very rarely
        domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TieredSales")), // Name
                keccak256(bytes("2.x")), // Version
                _chainId(),
                address(this)
            )
        );
    }

    function _chainId() private view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
    }
}
