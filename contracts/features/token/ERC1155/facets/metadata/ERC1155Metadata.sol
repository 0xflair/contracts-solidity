// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {IERC1155Metadata} from "./IERC1155Metadata.sol";
import {ERC1155MetadataInternal} from "./ERC1155MetadataInternal.sol";
import {ERC1155MetadataStorage} from "./ERC1155MetadataStorage.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ERC1155 metadata extensions
 */
abstract contract ERC1155Metadata is IERC1155Metadata, ERC1155MetadataInternal {
    /**
     * @notice inheritdoc IERC1155Metadata
     */
    function uri(uint256 tokenId) public view virtual returns (string memory) {
        ERC1155MetadataStorage.Layout storage l = ERC1155MetadataStorage
            .layout();

        string memory tokenIdURI = l.tokenURIs[tokenId];
        string memory baseURI = l.baseURI;

        if (bytes(baseURI).length == 0) {
            return tokenIdURI;
        } else if (bytes(tokenIdURI).length > 0) {
            return string(abi.encodePacked(baseURI, tokenIdURI));
        } else {
            return
                string(
                    abi.encodePacked(
                        baseURI,
                        l.fallbackURI,
                        Strings.toString(tokenId)
                    )
                );
        }
    }
}
