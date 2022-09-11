// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

/**
 * @title ERC1155 metadata extensions
 */
library ERC1155MetadataStorage {
    bytes32 internal constant STORAGE_SLOT =
        keccak256("v1.flair.contracts.storage.ERC1155Metadata");

    struct Layout {
        string baseURI;
        string fallbackURI;
        bool baseURILocked;
        bool fallbackURILocked;
        uint256 lastLockedTokenId;
        mapping(uint256 => string) tokenURIs;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
