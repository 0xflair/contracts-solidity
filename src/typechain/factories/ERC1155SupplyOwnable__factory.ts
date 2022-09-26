/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ERC1155SupplyOwnable,
  ERC1155SupplyOwnableInterface,
} from "../ERC1155SupplyOwnable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
    ],
    name: "TransferBatch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "TransferSingle",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newValue",
        type: "uint256",
      },
    ],
    name: "setMaxSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "newValues",
        type: "uint256[]",
      },
    ],
    name: "setMaxSupplyBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610392806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806337da577c1461003b5780636cf6a3fa14610050575b600080fd5b61004e610049366004610245565b610063565b005b61004e61005e3660046102b3565b61011f565b7fc0ea367cb0174dd5521cd2372c76f8c13e6c1f832c71f1d6e0cbc185c9cc8ed45473ffffffffffffffffffffffffffffffffffffffff1633146100ee5760405162461bcd60e51b815260206004820152601d60248201527f4f776e61626c653a2073656e646572206d757374206265206f776e657200000060448201526064015b60405180910390fd5b60009182527f7056dcda885936c7a9d7c6385902b4ab5fb09024caea98652b7189a5f7a28ea6602052604090912055565b7fc0ea367cb0174dd5521cd2372c76f8c13e6c1f832c71f1d6e0cbc185c9cc8ed45473ffffffffffffffffffffffffffffffffffffffff1633146101a55760405162461bcd60e51b815260206004820152601d60248201527f4f776e61626c653a2073656e646572206d757374206265206f776e657200000060448201526064016100e5565b6101b1848484846101b7565b50505050565b7f7056dcda885936c7a9d7c6385902b4ab5fb09024caea98652b7189a5f7a28ea660005b8481101561023d578383828181106101f5576101f561031f565b905060200201358260008888858181106102115761021161031f565b90506020020135815260200190815260200160002081905550808061023590610335565b9150506101db565b505050505050565b6000806040838503121561025857600080fd5b50508035926020909101359150565b60008083601f84011261027957600080fd5b50813567ffffffffffffffff81111561029157600080fd5b6020830191508360208260051b85010111156102ac57600080fd5b9250929050565b600080600080604085870312156102c957600080fd5b843567ffffffffffffffff808211156102e157600080fd5b6102ed88838901610267565b9096509450602087013591508082111561030657600080fd5b5061031387828801610267565b95989497509550505050565b634e487b7160e01b600052603260045260246000fd5b60006001820161035557634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220aa9584fe3da60424d3ae042b26fb769ec9cbacdfc39991e2785fb68354541b1c64736f6c634300080f0033";

export class ERC1155SupplyOwnable__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ERC1155SupplyOwnable> {
    return super.deploy(overrides || {}) as Promise<ERC1155SupplyOwnable>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ERC1155SupplyOwnable {
    return super.attach(address) as ERC1155SupplyOwnable;
  }
  connect(signer: Signer): ERC1155SupplyOwnable__factory {
    return super.connect(signer) as ERC1155SupplyOwnable__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC1155SupplyOwnableInterface {
    return new utils.Interface(_abi) as ERC1155SupplyOwnableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC1155SupplyOwnable {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ERC1155SupplyOwnable;
  }
}