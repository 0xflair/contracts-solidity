// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/overrides/RoyaltyOverrideCore.sol";

import "../../../misc/rarible/IRoyalties.sol";
import "../../../misc/rarible/LibPart.sol";
import "../../../misc/rarible/LibRoyaltiesV2.sol";

/**
 * @dev Extension to signal configured royalty to famous marketplaces as well as ERC2981.
 *
 * This extension currently supports Standard ERC2981, Rarible.
 * Note that OpenSea is supported via Flair metadata feature.
 */
abstract contract ERC721RoyaltyExtension is
    Ownable,
    EIP2981RoyaltyOverrideCore,
    IRoyalties
{
    address internal _raribleRoyaltyAddress;

    constructor(address raribleRoyaltyAddress) {
        _raribleRoyaltyAddress = raribleRoyaltyAddress;
    }

    function setTokenRoyalties(TokenRoyaltyConfig[] calldata royaltyConfigs)
        external
        override
        onlyOwner
    {
        _setTokenRoyalties(royaltyConfigs);
    }

    function setDefaultRoyalty(TokenRoyalty calldata royalty)
        external
        override
        onlyOwner
    {
        _setDefaultRoyalty(royalty);
    }

    function setRaribleRoyaltyAddress(address addr) external onlyOwner {
        _raribleRoyaltyAddress = addr;
    }

    function getRaribleV2Royalties(uint256 id)
        external
        view
        override
        returns (LibPart.Part[] memory result)
    {
        result = new LibPart.Part[](1);

        result[0].account = payable(_raribleRoyaltyAddress);
        result[0].value = 10000;
        // 100% of royalty goes to defined address above.
        id;
        // avoid unused param warning
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        if (interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES) {
            return true;
        }

        return super.supportsInterface(interfaceId);
    }
}
