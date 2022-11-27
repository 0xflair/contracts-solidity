// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../../../common/Errors.sol";
import "../../../../finance/royalty/RoyaltyEnforcementInternal.sol";
import "../../base/ERC721ABase.sol";

abstract contract ERC721ARoyaltyEnforcementExtension is RoyaltyEnforcementInternal, ERC721ABaseInternal {
    function _setApprovalForAll(address operator, bool approved)
        internal
        virtual
        override
        onlyAllowedOperatorApproval(operator)
    {
        super._setApprovalForAll(operator, approved);
    }

    function _approve(address operator, uint256 tokenId)
        internal
        virtual
        override
        onlyAllowedOperatorApproval(operator)
    {
        super._approve(operator, tokenId);
    }

    function _transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override onlyAllowedOperator(from) {
        super._transferFrom(from, to, tokenId);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override onlyAllowedOperator(from) {
        super._safeTransferFrom(from, to, tokenId);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual override onlyAllowedOperator(from) {
        super._safeTransferFrom(from, to, tokenId, data);
    }
}
