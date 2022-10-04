/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  FlairFactoryNewable,
  FlairFactoryNewableInterface,
} from "../FlairFactoryNewable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
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
        name: "deployer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "proxyAddress",
        type: "address",
      },
    ],
    name: "ProxyCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "cloneDeterministicSimple",
    outputs: [
      {
        internalType: "address",
        name: "deployedProxy",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61007a565b600080546001600160a01b038381166201000081810262010000600160b01b0319851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b61079d806100896000396000f3fe60806040526004361061005a5760003560e01c8063715018a611610043578063715018a6146100a55780638da5cb5b146100ba578063f2fde38b146100de57600080fd5b80633ccfd60b1461005f57806347791ece14610076575b600080fd5b34801561006b57600080fd5b506100746100fe565b005b61008961008436600461053c565b61012c565b6040516001600160a01b03909116815260200160405180910390f35b3480156100b157600080fd5b50610074610281565b3480156100c657600080fd5b506000546201000090046001600160a01b0316610089565b3480156100ea57600080fd5b506100746100f93660046105c3565b610293565b61012a4761011b6000546001600160a01b03620100009091041690565b6001600160a01b031690610323565b565b600080848660405161013d90610513565b6001600160a01b0390911681526020018190604051809103906000f590508015801561016d573d6000803e3d6000fd5b509150819050821561024257600080836001600160a01b031686866040516101969291906105e5565b6000604051808303816000865af19150503d80600081146101d3576040519150601f19603f3d011682016040523d82523d6000602084013e6101d8565b606091505b50915091508161023f578051156101f25780518082602001fd5b60405162461bcd60e51b815260206004820152600f60248201527f4641494c45445f544f5f434c4f4e45000000000000000000000000000000000060448201526064015b60405180910390fd5b50505b6040516001600160a01b0383169033907f9678a1e87ca9f1a37dc659a97b39d812d98cd236947e1b53b3d0d6fd346acb6e90600090a350949350505050565b610289610441565b61012a60006104a2565b61029b610441565b6001600160a01b0381166103175760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610236565b610320816104a2565b50565b804710156103735760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610236565b6000826001600160a01b03168260405160006040518083038185875af1925050503d80600081146103c0576040519150601f19603f3d011682016040523d82523d6000602084013e6103c5565b606091505b505090508061043c5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d617920686176652072657665727465640000000000006064820152608401610236565b505050565b6000546001600160a01b036201000090910416331461012a5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610236565b600080546001600160a01b03838116620100008181027fffffffffffffffffffff0000000000000000000000000000000000000000ffff851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b610172806105f683390190565b80356001600160a01b038116811461053757600080fd5b919050565b6000806000806060858703121561055257600080fd5b61055b85610520565b935060208501359250604085013567ffffffffffffffff8082111561057f57600080fd5b818701915087601f83011261059357600080fd5b8135818111156105a257600080fd5b8860208285010111156105b457600080fd5b95989497505060200194505050565b6000602082840312156105d557600080fd5b6105de82610520565b9392505050565b818382376000910190815291905056fe608060405260405161017238038061017283398101604081905261002291610080565b806100597f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b61007d60201b6100581760201c565b80546001600160a01b0319166001600160a01b0392909216919091179055506100b0565b90565b60006020828403121561009257600080fd5b81516001600160a01b03811681146100a957600080fd5b9392505050565b60b4806100be6000396000f3fe608060405236601057600e6013565b005b600e5b605660527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5473ffffffffffffffffffffffffffffffffffffffff1690565b605b565b565b90565b3660008037600080366000845af43d6000803e8080156079573d6000f35b3d6000fdfea264697066735822122010e3d1afd2c437d773a5002b589123ae499d9167b69637e26ef5120fc87f46dc64736f6c634300080f0033a2646970667358221220c8d7bdc8f7d30b32305d48611f9fd4da7f6113dd51630b06a3da4afaf9f9b7c064736f6c634300080f0033";

export class FlairFactoryNewable__factory extends ContractFactory {
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
  ): Promise<FlairFactoryNewable> {
    return super.deploy(overrides || {}) as Promise<FlairFactoryNewable>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): FlairFactoryNewable {
    return super.attach(address) as FlairFactoryNewable;
  }
  connect(signer: Signer): FlairFactoryNewable__factory {
    return super.connect(signer) as FlairFactoryNewable__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlairFactoryNewableInterface {
    return new utils.Interface(_abi) as FlairFactoryNewableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlairFactoryNewable {
    return new Contract(address, _abi, signerOrProvider) as FlairFactoryNewable;
  }
}