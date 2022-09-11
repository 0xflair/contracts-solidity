// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import {OwnableStorage} from "../facets/access/ownable/OwnableStorage.sol";
import {IERC173} from "../facets/access/ownable/IERC173.sol";
import {IERC165, ERC165Storage} from "../facets/introspection/ERC165.sol";
import {ERC2771Context} from "../facets/metatx/ERC2771Context.sol";
import {IDiamondCut} from "../facets/diamond/IDiamondCut.sol";
import {IDiamondLoupe} from "../facets/diamond/IDiamondLoupe.sol";

import {DiamondStorage} from "./DiamondStorage.sol";

contract Diamond {
    using ERC165Storage for ERC165Storage.Layout;
    using OwnableStorage for OwnableStorage.Layout;

    constructor(
        address owner,
        address diamondCutFacet,
        address diamondLoupeFacet,
        address erc165Facet,
        address ownableFacet,
        address contextFacet
    ) {
        ERC165Storage.Layout storage erc165 = ERC165Storage.layout();

        // register DiamondCut

        bytes4[] memory selectorsDiamondCut = new bytes4[](1);
        selectorsDiamondCut[0] = IDiamondCut.diamondCut.selector;

        erc165.setSupportedInterface(type(IDiamondCut).interfaceId, true);

        // register DiamondLoupe

        bytes4[] memory selectorsDiamondLoupe = new bytes4[](4);
        selectorsDiamondLoupe[0] = IDiamondLoupe.facets.selector;
        selectorsDiamondLoupe[1] = IDiamondLoupe
            .facetFunctionSelectors
            .selector;
        selectorsDiamondLoupe[2] = IDiamondLoupe.facetAddresses.selector;
        selectorsDiamondLoupe[3] = IDiamondLoupe.facetAddress.selector;

        erc165.setSupportedInterface(type(IDiamondLoupe).interfaceId, true);

        // register ERC165 (supportsInterface)

        bytes4[] memory selectorsERC165 = new bytes4[](1);
        selectorsERC165[0] = IERC165.supportsInterface.selector;

        erc165.setSupportedInterface(type(IERC165).interfaceId, true);

        // register ERC173 (Ownable)

        bytes4[] memory selectorsOwnable = new bytes4[](2);
        selectorsOwnable[0] = IERC173.owner.selector;
        selectorsOwnable[1] = IERC173.transferOwnership.selector;

        erc165.setSupportedInterface(type(IERC173).interfaceId, true);

        // register ERC2771 (Context)

        bytes4[] memory selectorsContext = new bytes4[](2);
        selectorsContext[0] = ERC2771Context.setTrustedForwarder.selector;
        selectorsContext[1] = ERC2771Context.isTrustedForwarder.selector;

        // execute the first ever diamond cut
        // we are calling the addFunctions directly to save ~ %50 gas

        DiamondStorage.addFunctions(diamondCutFacet, selectorsDiamondCut);
        DiamondStorage.addFunctions(diamondLoupeFacet, selectorsDiamondLoupe);
        DiamondStorage.addFunctions(erc165Facet, selectorsERC165);
        DiamondStorage.addFunctions(ownableFacet, selectorsOwnable);
        DiamondStorage.addFunctions(contextFacet, selectorsContext);

        // set owner

        OwnableStorage.layout().setOwner(owner);
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        DiamondStorage.Layout storage l;
        bytes32 position = DiamondStorage.DIAMOND_STORAGE_POSITION;
        // get diamond storage
        assembly {
            l.slot := position
        }

        // get facet from function selector
        address facet = l.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "BAD_FUNC");

        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {}
}
