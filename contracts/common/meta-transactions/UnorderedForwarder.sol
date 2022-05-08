// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract UnorderedForwarder is EIP712, ReentrancyGuard {
    using ECDSA for bytes32;

    struct UnorderedMetaTransaction {
        address from;
        address to;
        uint256 value;
        uint256 minGasPrice;
        uint256 maxGasPrice;
        uint256 expiresAt;
        uint256 nonce;
        bytes data;
    }

    bytes32 private constant _TYPEHASH =
        keccak256(
            "UnorderedMetaTransaction(address from,address to,uint256 value,uint256 minGasPrice,uint256 maxGasPrice,uint256 expiresAt,uint256 nonce,bytes data)"
        );

    mapping(bytes32 => uint256) mtxHashToExecutedBlockNumber;

    constructor() EIP712("UnorderedForwarder", "0.0.1") {}

    /// @dev Refunds up to `msg.value` leftover ETH at the end of the call.
    modifier refundsAttachedEth() {
        _;
        uint256 remainingBalance = msg.value > address(this).balance
            ? address(this).balance
            : msg.value;
        if (remainingBalance > 0) {
            payable(msg.sender).transfer(remainingBalance);
        }
    }

    /// @dev Ensures that the ETH balance of `this` does not go below the
    ///      initial ETH balance before the call (excluding ETH attached to the call).
    modifier doesNotReduceEthBalance() {
        uint256 initialBalance = address(this).balance - msg.value;
        _;
        require(initialBalance <= address(this).balance, "FWD_ETH_LEAK");
    }

    function verify(
        UnorderedMetaTransaction calldata mtx,
        bytes calldata signature
    ) public view returns (bool valid, bytes32 mtxHash) {
        mtxHash = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _TYPEHASH,
                    mtx.from,
                    mtx.to,
                    mtx.value,
                    mtx.minGasPrice,
                    mtx.maxGasPrice,
                    mtx.expiresAt,
                    mtx.nonce,
                    keccak256(mtx.data)
                )
            )
        );

        address signer = mtxHash.recover(signature);

        valid =
            mtxHashToExecutedBlockNumber[mtxHash] == 0 &&
            signer == mtx.from;
    }

    function execute(
        UnorderedMetaTransaction calldata mtx,
        bytes calldata signature
    )
        public
        payable
        nonReentrant
        doesNotReduceEthBalance
        refundsAttachedEth
        returns (bytes memory)
    {
        return _execute(mtx, signature);
    }

    function batchExecute(
        UnorderedMetaTransaction[] calldata mtxs,
        bytes[] calldata signatures
    )
        public
        payable
        nonReentrant
        doesNotReduceEthBalance
        refundsAttachedEth
        returns (bytes[] memory returnResults)
    {
        require(mtxs.length == signatures.length, "FWD_MISMATCH_SIGNATURES");

        returnResults = new bytes[](mtxs.length);

        for (uint256 i = 0; i < mtxs.length; ++i) {
            returnResults[i] = _execute(mtxs[i], signatures[i]);
        }
    }

    function _execute(
        UnorderedMetaTransaction calldata mtx,
        bytes calldata signature
    ) internal returns (bytes memory) {
        (bool valid, bytes32 mtxHash) = verify(mtx, signature);

        require(valid, "FWD_INVALID_SIGNATURE");

        mtxHashToExecutedBlockNumber[mtxHash] = block.number;

        (bool success, bytes memory returndata) = mtx.to.call{value: mtx.value}(
            abi.encodePacked(mtx.data, mtx.from)
        );

        require(success, "FWD_CALL_FAILED");

        return returndata;
    }
}
