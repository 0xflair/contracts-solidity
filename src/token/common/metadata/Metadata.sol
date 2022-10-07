// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./IMetadata.sol";
import "./MetadataStorage.sol";

/**
 * @title Metadata
 * @notice Provides common functions for various token metadata standards. This extension supports base URI, per-token URI, and a fallback URI. You can also freeze URIs until a certain token ID.
 *
 * @custom:type eip-2535-facet
 * @custom:category NFTs
 * @custom:provides-interfaces IMetadata
 */
contract Metadata is IMetadata {
    function name() external view virtual override returns (string memory) {
        return MetadataStorage.layout().name;
    }

    function symbol() external view virtual override returns (string memory) {
        return MetadataStorage.layout().symbol;
    }

    function baseURI() external view virtual returns (string memory) {
        return MetadataStorage.layout().baseURI;
    }

    function fallbackURI() external view virtual returns (string memory) {
        return MetadataStorage.layout().fallbackURI;
    }

    function uriSuffix() external view virtual returns (string memory) {
        return MetadataStorage.layout().uriSuffix;
    }

    function baseURILocked() external view virtual returns (bool) {
        return MetadataStorage.layout().baseURILocked;
    }

    function fallbackURILocked() external view virtual returns (bool) {
        return MetadataStorage.layout().fallbackURILocked;
    }

    function uriSuffixLocked() external view virtual returns (bool) {
        return MetadataStorage.layout().uriSuffixLocked;
    }

    function lastLockedTokenId() external view virtual returns (uint256) {
        return MetadataStorage.layout().lastLockedTokenId;
    }
}
