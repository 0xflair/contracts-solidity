// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../../../../common/Errors.sol";
import "../../base/ERC721ABaseInternal.sol";
import "./IERC721Burnable.sol";

/**
 * @title Extension of {ERC721A} that allows users or approved operators to burn tokens.
 */
abstract contract ERC721ABurnable is IERC721Burnable, ERC721ABaseInternal {
    function burn(uint256 id) public virtual {
        _burn(id, true);
    }

    function burnBatch(uint256[] memory ids) public virtual {
        for (uint256 i = 0; i < ids.length; i++) {
            _burn(ids[i], true);
        }
    }

    /**
     * @dev Burn from another facet, allow skipping of ownership check as facets are trusted.
     */
    function burnByFacet(uint256 id, bool ownershipCheck) public virtual {
        if (address(this) != msg.sender) {
            revert ErrSenderIsNotSelf();
        }

        _burn(id, ownershipCheck);
    }

    /**
     * @dev Burn from another facet, allow skipping of ownership check as facets are trusted.
     */
    function burnBatchByFacet(uint256[] memory ids, bool ownershipCheck) public virtual {
        if (address(this) != msg.sender) {
            revert ErrSenderIsNotSelf();
        }

        for (uint256 i = 0; i < ids.length; i++) {
            _burn(ids[i], ownershipCheck);
        }
    }
}
