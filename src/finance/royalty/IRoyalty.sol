// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.15;

import "@manifoldxyz/royalty-registry-solidity/contracts/overrides/IRoyaltyOverride.sol";

import "./rarible/IRoyalties.sol";
import "./rarible/LibPart.sol";
import "./IRoyaltyInternal.sol";

interface IRoyalty is IRoyaltyInternal, IRoyalties {
    /**
     * @dev Default royalty for all tokens without a specific royalty.
     */
    function defaultRoyalty() external view returns (TokenRoyalty memory);

    /**
     * @dev EIP-2981 method to return the royalty amount for a given token and value.
     */
    function royaltyInfo(uint256 tokenId, uint256 value) external view returns (address, uint256);

    /**
     * @dev Get the number of token specific overrides.  Used to enumerate over all configurations
     */
    function getTokenRoyaltiesCount() external view returns (uint256);

    /**
     * @dev Get a token royalty configuration by index.  Use in conjunction with getTokenRoyaltiesCount to get all per token configurations
     */
    function getTokenRoyaltyByIndex(uint256 index) external view returns (TokenRoyaltyConfig memory);
}
