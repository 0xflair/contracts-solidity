// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../../../../common/Errors.sol";
import "../../../../finance/royalty/RoyaltyEnforcementInternal.sol";
import "../../base/ERC1155BaseInternal.sol";

abstract contract ERC1155RoyaltyEnforcementExtension is RoyaltyEnforcementInternal, ERC1155BaseInternal {
    function _setApprovalForAll(address operator, bool approved)
        internal
        virtual
        override
        onlyAllowedOperatorApproval(operator)
    {
        super._setApprovalForAll(operator, approved);
    }

    function _safeTransferBatch(
        address operator,
        address sender,
        address recipient,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override onlyAllowedOperator(operator) {
        super._safeTransferBatch(operator, sender, recipient, ids, amounts, data);
    }

    function _transferBatch(
        address operator,
        address sender,
        address recipient,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override onlyAllowedOperator(operator) {
        super._transferBatch(operator, sender, recipient, ids, amounts, data);
    }

    function _safeTransfer(
        address operator,
        address sender,
        address recipient,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) internal virtual override onlyAllowedOperator(operator) {
        super._safeTransfer(operator, sender, recipient, id, amount, data);
    }

    function _transfer(
        address operator,
        address sender,
        address recipient,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) internal virtual override onlyAllowedOperator(operator) {
        super._transfer(operator, sender, recipient, id, amount, data);
    }
}
