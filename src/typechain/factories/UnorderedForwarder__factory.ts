/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UnorderedForwarder,
  UnorderedForwarderInterface,
} from "../UnorderedForwarder";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct UnorderedForwarder.MetaTransaction[]",
        name: "mtxs",
        type: "tuple[]",
      },
      {
        internalType: "bytes[]",
        name: "signatures",
        type: "bytes[]",
      },
    ],
    name: "batchExecute",
    outputs: [
      {
        internalType: "bytes[]",
        name: "returnResults",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct UnorderedForwarder.MetaTransaction",
        name: "mtx",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxGasPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiresAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct UnorderedForwarder.MetaTransaction",
        name: "mtx",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "bytes32",
        name: "mtxHash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x61014060405234801561001157600080fd5b5060408051808201825260128152712ab737b93232b932b22337b93bb0b93232b960711b602080830191825283518085019094526005845264302e302e3160d81b908401528151902060e08190527fae209a0b48f21c054280f2455d32cf309387644879d9acbd8ffc1991638118856101008190524660a0529192917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6100fd8184846040805160208101859052908101839052606081018290524660808201523060a082015260009060c0016040516020818303038152906040528051906020012090509392505050565b6080523060c0526101205250506001600055506101179050565b60805160a05160c05160e05161010051610120516110b2610166600039600061095f015260006109ae01526000610989015260006108e20152600061090c0152600061093601526110b26000f3fe6080604052600436106100345760003560e01c8063b0565b2714610039578063b122ea941461006c578063cd74662f1461008c575b600080fd5b34801561004557600080fd5b50610059610054366004610ce7565b6100ac565b6040519081526020015b60405180910390f35b61007f61007a366004610dcc565b610300565b6040516100639190610e94565b61009f61009a366004610ce7565b610536565b6040516100639190610ef6565b60006101957f2bbaa6c701d9ecd9e324adef5727bb11883e2c24df1dd4c8f19e4e038b3734666100df6020870187610f09565b6100ef6040880160208901610f09565b6040880135606089013560808a013560a08b013560c08c013561011560e08e018e610f32565b604051610123929190610f79565b60408051918290038220602083019a909a526001600160a01b0398891690820152969095166060870152608086019390935260a085019190915260c084015260e08301526101008201526101208101919091526101400160405160208183030381529060405280519060200120610650565b9050428460a00135116101ef5760405162461bcd60e51b815260206004820152600b60248201527f4657445f4558504952454400000000000000000000000000000000000000000060448201526064015b60405180910390fd5b6101fc6020850185610f09565b6001600160a01b031661024784848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525086939250506106bf9050565b6001600160a01b03161461029d5760405162461bcd60e51b815260206004820152601560248201527f4657445f494e56414c49445f5349474e4154555245000000000000000000000060448201526064016101e6565b600081815260016020526040902054156102f95760405162461bcd60e51b815260206004820152600c60248201527f4657445f5245504c41594544000000000000000000000000000000000000000060448201526064016101e6565b9392505050565b60606002600054036103545760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016101e6565b600260009081556103653447610f9f565b90508483146103b65760405162461bcd60e51b815260206004820152601760248201527f4657445f4d49534d415443485f5349474e41545552455300000000000000000060448201526064016101e6565b8467ffffffffffffffff8111156103cf576103cf610fb6565b60405190808252806020026020018201604052801561040257816020015b60608152602001906001900390816103ed5790505b50915060005b8581101561048e5761046087878381811061042557610425610fcc565b90506020028101906104379190610fe2565b86868481811061044957610449610fcc565b905060200281019061045b9190610f32565b6106e3565b83828151811061047257610472610fcc565b60200260200101819052508061048790611002565b9050610408565b50600047341161049e57346104a0565b475b905080156104d757604051339082156108fc029083906000818181858888f193505050501580156104d5573d6000803e3d6000fd5b505b50478111156105285760405162461bcd60e51b815260206004820152600c60248201527f4657445f4554485f4c45414b000000000000000000000000000000000000000060448201526064016101e6565b506001600055949350505050565b606060026000540361058a5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016101e6565b6002600090815561059b3447610f9f565b90506105a88585856106e3565b915060004734116105b957346105bb565b475b905080156105f257604051339082156108fc029083906000818181858888f193505050501580156105f0573d6000803e3d6000fd5b505b50478111156106435760405162461bcd60e51b815260206004820152600c60248201527f4657445f4554485f4c45414b000000000000000000000000000000000000000060448201526064016101e6565b5060016000559392505050565b60006106b961065d6108d5565b836040517f19010000000000000000000000000000000000000000000000000000000000006020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b92915050565b60008060006106ce85856109fc565b915091506106db81610a41565b509392505050565b60603a8460600135111580156106fd575083608001353a11155b6107495760405162461bcd60e51b815260206004820152600f60248201527f4657445f494e56414c49445f474153000000000000000000000000000000000060448201526064016101e6565b478460400135111561079d5760405162461bcd60e51b815260206004820152601160248201527f4657445f494e56414c49445f56414c554500000000000000000000000000000060448201526064016101e6565b60006107aa8585856100ac565b6000818152600160209081526040808320439055929350909182916107d3918901908901610f09565b6001600160a01b031660408801356107ee60e08a018a610f32565b6107fb60208c018c610f09565b60405160200161080d9392919061101b565b60408051601f198184030181529082905261082791611054565b60006040518083038185875af1925050503d8060008114610864576040519150601f19603f3d011682016040523d82523d6000602084013e610869565b606091505b5091509150816108cb578051156108835780518082602001fd5b60405162461bcd60e51b815260206004820152600f60248201527f4657445f43414c4c5f4641494c4544000000000000000000000000000000000060448201526064016101e6565b9695505050505050565b6000306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614801561092e57507f000000000000000000000000000000000000000000000000000000000000000046145b1561095857507f000000000000000000000000000000000000000000000000000000000000000090565b50604080517f00000000000000000000000000000000000000000000000000000000000000006020808301919091527f0000000000000000000000000000000000000000000000000000000000000000828401527f000000000000000000000000000000000000000000000000000000000000000060608301524660808301523060a0808401919091528351808403909101815260c0909201909252805191012090565b6000808251604103610a325760208301516040840151606085015160001a610a2687828585610bfa565b94509450505050610a3a565b506000905060025b9250929050565b6000816004811115610a5557610a55611066565b03610a5d5750565b6001816004811115610a7157610a71611066565b03610abe5760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e6174757265000000000000000060448201526064016101e6565b6002816004811115610ad257610ad2611066565b03610b1f5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e6774680060448201526064016101e6565b6003816004811115610b3357610b33611066565b03610b8b5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b60648201526084016101e6565b6004816004811115610b9f57610b9f611066565b03610bf75760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b60648201526084016101e6565b50565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610c315750600090506003610cde565b8460ff16601b14158015610c4957508460ff16601c14155b15610c5a5750600090506004610cde565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610cae573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610cd757600060019250925050610cde565b9150600090505b94509492505050565b600080600060408486031215610cfc57600080fd5b833567ffffffffffffffff80821115610d1457600080fd5b908501906101008288031215610d2957600080fd5b90935060208501359080821115610d3f57600080fd5b818601915086601f830112610d5357600080fd5b813581811115610d6257600080fd5b876020828501011115610d7457600080fd5b6020830194508093505050509250925092565b60008083601f840112610d9957600080fd5b50813567ffffffffffffffff811115610db157600080fd5b6020830191508360208260051b8501011115610a3a57600080fd5b60008060008060408587031215610de257600080fd5b843567ffffffffffffffff80821115610dfa57600080fd5b610e0688838901610d87565b90965094506020870135915080821115610e1f57600080fd5b50610e2c87828801610d87565b95989497509550505050565b60005b83811015610e53578181015183820152602001610e3b565b83811115610e62576000848401525b50505050565b60008151808452610e80816020860160208601610e38565b601f01601f19169290920160200192915050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015610ee957603f19888603018452610ed7858351610e68565b94509285019290850190600101610ebb565b5092979650505050505050565b6020815260006102f96020830184610e68565b600060208284031215610f1b57600080fd5b81356001600160a01b03811681146102f957600080fd5b6000808335601e19843603018112610f4957600080fd5b83018035915067ffffffffffffffff821115610f6457600080fd5b602001915036819003821315610a3a57600080fd5b8183823760009101908152919050565b634e487b7160e01b600052601160045260246000fd5b600082821015610fb157610fb1610f89565b500390565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6000823560fe19833603018112610ff857600080fd5b9190910192915050565b60006001820161101457611014610f89565b5060010190565b8284823760609190911b7fffffffffffffffffffffffffffffffffffffffff000000000000000000000000169101908152601401919050565b60008251610ff8818460208701610e38565b634e487b7160e01b600052602160045260246000fdfea264697066735822122039e6a60b11d6f061f2da1e791d621d94acc7570e414d8635d822865fc60c525464736f6c634300080f0033";

export class UnorderedForwarder__factory extends ContractFactory {
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
  ): Promise<UnorderedForwarder> {
    return super.deploy(overrides || {}) as Promise<UnorderedForwarder>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): UnorderedForwarder {
    return super.attach(address) as UnorderedForwarder;
  }
  connect(signer: Signer): UnorderedForwarder__factory {
    return super.connect(signer) as UnorderedForwarder__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UnorderedForwarderInterface {
    return new utils.Interface(_abi) as UnorderedForwarderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UnorderedForwarder {
    return new Contract(address, _abi, signerOrProvider) as UnorderedForwarder;
  }
}