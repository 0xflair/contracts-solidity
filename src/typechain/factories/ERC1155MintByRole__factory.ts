/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ERC1155MintByRole,
  ERC1155MintByRoleInterface,
} from "../ERC1155MintByRole";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "mintByRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610740806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806372642f5614610046578063a217fddf1461005b578063d539139314610075575b600080fd5b61005961005436600461046b565b61009c565b005b610063600081565b60405190815260200160405180910390f35b6100637f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a66100c681610141565b6040517fb164884b000000000000000000000000000000000000000000000000000000008152309063b164884b906101089088908890889088906004016105b7565b600060405180830381600087803b15801561012257600080fd5b505af1158015610136573d6000803e3d6000fd5b505050505050505050565b61014b813361014e565b50565b60008281527f2e59e4c2e927cdddbb64e181e0668d9a0fa70dd88f94d999cd87d5496a20da626020908152604080832073ffffffffffffffffffffffffffffffffffffffff8516845290915290205460ff166101f8576101ad816101fc565b6101b8836020610225565b6040516020016101c99291906105fc565b60408051601f198184030181529082905262461bcd60e51b82526101ef9160040161067d565b60405180910390fd5b5050565b606061021f73ffffffffffffffffffffffffffffffffffffffff83166014610225565b92915050565b606060006102348360026106a6565b61023f9060026106c5565b67ffffffffffffffff81111561025757610257610455565b6040519080825280601f01601f191660200182016040528015610281576020820181803683370190505b5090507f3000000000000000000000000000000000000000000000000000000000000000816000815181106102b8576102b86106dd565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f78000000000000000000000000000000000000000000000000000000000000008160018151811061031b5761031b6106dd565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060006103578460026106a6565b6103629060016106c5565b90505b60018111156103ff577f303132333435363738396162636465660000000000000000000000000000000085600f16601081106103a3576103a36106dd565b1a60f81b8282815181106103b9576103b96106dd565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060049490941c936103f8816106f3565b9050610365565b50831561044e5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016101ef565b9392505050565b634e487b7160e01b600052604160045260246000fd5b6000806000806080858703121561048157600080fd5b843573ffffffffffffffffffffffffffffffffffffffff811681146104a557600080fd5b93506020850135925060408501359150606085013567ffffffffffffffff808211156104d057600080fd5b818701915087601f8301126104e457600080fd5b8135818111156104f6576104f6610455565b604051601f8201601f19908116603f0116810190838211818310171561051e5761051e610455565b816040528281528a602084870101111561053757600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b60005b8381101561057657818101518382015260200161055e565b83811115610585576000848401525b50505050565b600081518084526105a381602086016020860161055b565b601f01601f19169290920160200192915050565b73ffffffffffffffffffffffffffffffffffffffff851681528360208201528260408201526080606082015260006105f2608083018461058b565b9695505050505050565b7f416363657373436f6e74726f6c3a206163636f756e742000000000000000000081526000835161063481601785016020880161055b565b7f206973206d697373696e6720726f6c6520000000000000000000000000000000601791840191820152835161067181602884016020880161055b565b01602801949350505050565b60208152600061044e602083018461058b565b634e487b7160e01b600052601160045260246000fd5b60008160001904831182151516156106c0576106c0610690565b500290565b600082198211156106d8576106d8610690565b500190565b634e487b7160e01b600052603260045260246000fd5b60008161070257610702610690565b50600019019056fea26469706673582212205192bd73b4ae3f4b62e644ec5a1aa1661738e9639c4b53728ef3ad3add09993564736f6c634300080f0033";

export class ERC1155MintByRole__factory extends ContractFactory {
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
  ): Promise<ERC1155MintByRole> {
    return super.deploy(overrides || {}) as Promise<ERC1155MintByRole>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ERC1155MintByRole {
    return super.attach(address) as ERC1155MintByRole;
  }
  connect(signer: Signer): ERC1155MintByRole__factory {
    return super.connect(signer) as ERC1155MintByRole__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC1155MintByRoleInterface {
    return new utils.Interface(_abi) as ERC1155MintByRoleInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC1155MintByRole {
    return new Contract(address, _abi, signerOrProvider) as ERC1155MintByRole;
  }
}