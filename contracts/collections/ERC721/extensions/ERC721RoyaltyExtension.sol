// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/overrides/IRoyaltyOverride.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/overrides/RoyaltyOverrideCore.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "../../../misc/rarible/IRoyalties.sol";
import "../../../misc/rarible/LibPart.sol";
import "../../../misc/rarible/LibRoyaltiesV2.sol";

interface ERC721RoyaltyExtensionInterface is IERC165 {
    function setTokenRoyalties(
        IEIP2981RoyaltyOverride.TokenRoyaltyConfig[] calldata royaltyConfigs
    ) external;

    function setDefaultRoyalty(
        IEIP2981RoyaltyOverride.TokenRoyalty calldata royalty
    ) external;

    function getRaribleV2Royalties(uint256 id)
        external
        view
        returns (LibPart.Part[] memory result);
}

/**
 * @dev Extension to signal configured royalty to famous marketplaces as well as ERC2981.
 *
 * This extension currently supports Standard ERC2981, Rarible.
 * Note that OpenSea is supported via Flair metadata feature.
 */
abstract contract ERC721RoyaltyExtension is
    Ownable,
    EIP2981RoyaltyOverrideCore,
    IRoyalties,
    ERC721RoyaltyExtensionInterface
{
    constructor(address defaultRoyaltyReceiver, uint16 defaultRoyaltyBps) {
        TokenRoyalty memory royalty = TokenRoyalty(
            defaultRoyaltyReceiver,
            defaultRoyaltyBps
        );

        _setDefaultRoyalty(royalty);
    }

    function setTokenRoyalties(TokenRoyaltyConfig[] calldata royaltyConfigs)
        external
        override(IEIP2981RoyaltyOverride, ERC721RoyaltyExtensionInterface)
        onlyOwner
    {
        _setTokenRoyalties(royaltyConfigs);
    }

    function setDefaultRoyalty(TokenRoyalty calldata royalty)
        external
        override(IEIP2981RoyaltyOverride, ERC721RoyaltyExtensionInterface)
        onlyOwner
    {
        _setDefaultRoyalty(royalty);
    }

    function getRaribleV2Royalties(uint256 id)
        external
        view
        override(IRoyalties, ERC721RoyaltyExtensionInterface)
        returns (LibPart.Part[] memory result)
    {
        result = new LibPart.Part[](1);

        result[0].account = payable(defaultRoyalty.recipient);
        result[0].value = defaultRoyalty.bps;

        id;
        // avoid unused param warning
    }

    // PUBLIC

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, EIP2981RoyaltyOverrideCore)
        returns (bool)
    {
        if (interfaceId == LibRoyaltiesV2._INTERFACE_ID_ROYALTIES) {
            return true;
        }

        if (interfaceId == type(ERC721RoyaltyExtensionInterface).interfaceId) {
            return true;
        }

        return super.supportsInterface(interfaceId);
    }
}
