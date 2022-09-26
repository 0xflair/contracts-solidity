/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DiamondCut, DiamondCutInterface } from "../DiamondCut";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "facet",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "DiamondFacetAlreadyExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "facet",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "DiamondFacetSameFunction",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "enum IDiamondCut.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        indexed: false,
        internalType: "struct IDiamondCut.FacetCut[]",
        name: "_diamondCut",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_init",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "DiamondCut",
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
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "enum IDiamondCut.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        internalType: "struct IDiamondCut.FacetCut[]",
        name: "_diamondCut",
        type: "tuple[]",
      },
      {
        internalType: "address",
        name: "_init",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "diamondCut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611321806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80631f931c1c14610030575b600080fd5b61004361003e366004610dd5565b610045565b005b7fc0ea367cb0174dd5521cd2372c76f8c13e6c1f832c71f1d6e0cbc185c9cc8ed4546001600160a01b031633146100c35760405162461bcd60e51b815260206004820152601d60248201527f4f776e61626c653a2073656e646572206d757374206265206f776e657200000060448201526064015b60405180910390fd5b61010d6100d08587610f1b565b8484848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061011492505050565b5050505050565b60005b83518110156102f05760008482815181106101345761013461105f565b60200260200101516020015190506000600281111561015557610155611075565b81600281111561016757610167611075565b036101b5576101b08583815181106101815761018161105f565b60200260200101516000015186848151811061019f5761019f61105f565b60200260200101516040015161033b565b6102dd565b60018160028111156101c9576101c9611075565b03610212576101b08583815181106101e3576101e361105f565b6020026020010151600001518684815181106102015761020161105f565b602002602001015160400151610525565b600281600281111561022657610226611075565b0361026f576101b08583815181106102405761024061105f565b60200260200101516000015186848151811061025e5761025e61105f565b60200260200101516040015161071f565b60405162461bcd60e51b815260206004820152602760248201527f4c69624469616d6f6e644375743a20496e636f7272656374204661636574437560448201527f74416374696f6e0000000000000000000000000000000000000000000000000060648201526084016100ba565b50806102e8816110a1565b915050610117565b507f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb67383838360405161032493929190611112565b60405180910390a161033682826107b8565b505050565b6001600160a01b03821660009081527fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d60205260408120547fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c916bffffffffffffffffffffffff821690036103b4576103b482856109dc565b60005b835181101561010d5760008482815181106103d4576103d461105f565b6020908102919091018101516001600160e01b031981166000908152918690526040909120549091506001600160a01b03168015610459576040517f752eb76d0000000000000000000000000000000000000000000000000000000081526001600160a01b03821660048201526001600160e01b0319831660248201526044016100ba565b6001600160e01b0319821660008181526020878152604080832080546001600160a01b03908116600160a01b6bffffffffffffffffffffffff8c16021782558c168085526001808c0185529285208054938401815585528385206008840401805463ffffffff60079095166004026101000a948502191660e08a901c949094029390931790925593909252879052815473ffffffffffffffffffffffffffffffffffffffff19161790558361050d81611211565b9450505050808061051d906110a1565b9150506103b7565b6001600160a01b03821660009081527fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d60205260408120547fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c916bffffffffffffffffffffffff8216900361059e5761059e82856109dc565b60005b835181101561010d5760008482815181106105be576105be61105f565b6020908102919091018101516001600160e01b031981166000908152918690526040909120549091506001600160a01b039081169087168103610648576040517f0f63c2400000000000000000000000000000000000000000000000000000000081526001600160a01b03821660048201526001600160e01b0319831660248201526044016100ba565b610653858284610a53565b6001600160e01b0319821660008181526020878152604080832080546001600160a01b03908116600160a01b6bffffffffffffffffffffffff8c16021782558c168085526001808c0185529285208054938401815585528385206008840401805463ffffffff60079095166004026101000a948502191660e08a901c949094029390931790925593909252879052815473ffffffffffffffffffffffffffffffffffffffff19161790558361070781611211565b94505050508080610717906110a1565b9150506105a1565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c60005b82518110156107b25760008382815181106107605761076061105f565b6020908102919091018101516001600160e01b031981166000908152918590526040909120549091506001600160a01b031661079d848284610a53565b505080806107aa906110a1565b915050610743565b50505050565b6001600160a01b03821661083f5780511561083b5760405162461bcd60e51b815260206004820152603c60248201527f4c69624469616d6f6e644375743a205f696e697420697320616464726573732860448201527f3029206275745f63616c6c64617461206973206e6f7420656d7074790000000060648201526084016100ba565b5050565b60008151116108b65760405162461bcd60e51b815260206004820152603d60248201527f4c69624469616d6f6e644375743a205f63616c6c6461746120697320656d707460448201527f7920627574205f696e6974206973206e6f74206164647265737328302900000060648201526084016100ba565b6001600160a01b03821630146108e8576108e8826040518060600160405280602881526020016112a060289139610d4f565b600080836001600160a01b031683604051610903919061123c565b600060405180830381855af49150503d806000811461093e576040519150601f19603f3d011682016040523d82523d6000602084013e610943565b606091505b5091509150816107b25780511561096e578060405162461bcd60e51b81526004016100ba9190611258565b60405162461bcd60e51b815260206004820152602660248201527f4c69624469616d6f6e644375743a205f696e69742066756e6374696f6e20726560448201527f766572746564000000000000000000000000000000000000000000000000000060648201526084016100ba565b6109fe816040518060600160405280602481526020016112c860249139610d4f565b6002820180546001600160a01b03909216600081815260019485016020908152604082208601859055948401835591825292902001805473ffffffffffffffffffffffffffffffffffffffff19169091179055565b6001600160e01b03198116600090815260208481526040808320546001600160a01b0386168452600180880190935290832054600160a01b9091046bffffffffffffffffffffffff169291610aa791611272565b9050808214610b9e576001600160a01b03841660009081526001860160205260408120805483908110610adc57610adc61105f565b600091825260208083206008830401546001600160a01b038916845260018a019091526040909220805460079092166004026101000a90920460e01b925082919085908110610b2d57610b2d61105f565b600091825260208083206008830401805463ffffffff60079094166004026101000a938402191660e09590951c929092029390931790556001600160e01b03199290921682528690526040902080546001600160a01b0316600160a01b6bffffffffffffffffffffffff8516021790555b6001600160a01b03841660009081526001860160205260409020805480610bc757610bc7611289565b60008281526020808220600860001990940193840401805463ffffffff600460078716026101000a0219169055919092556001600160e01b0319851682528690526040812081905581900361010d576002850154600090610c2a90600190611272565b6001600160a01b0386166000908152600180890160205260409091200154909150808214610ce6576000876002018381548110610c6957610c6961105f565b6000918252602090912001546002890180546001600160a01b039092169250829184908110610c9a57610c9a61105f565b6000918252602080832091909101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03948516179055929091168152600189810190925260409020018190555b86600201805480610cf957610cf9611289565b600082815260208082208301600019908101805473ffffffffffffffffffffffffffffffffffffffff191690559092019092556001600160a01b0388168252600189810190915260408220015550505050505050565b813b81816107b25760405162461bcd60e51b81526004016100ba9190611258565b80356001600160a01b0381168114610d8757600080fd5b919050565b60008083601f840112610d9e57600080fd5b50813567ffffffffffffffff811115610db657600080fd5b602083019150836020828501011115610dce57600080fd5b9250929050565b600080600080600060608688031215610ded57600080fd5b853567ffffffffffffffff80821115610e0557600080fd5b818801915088601f830112610e1957600080fd5b813581811115610e2857600080fd5b8960208260051b8501011115610e3d57600080fd5b60208301975080965050610e5360208901610d70565b94506040880135915080821115610e6957600080fd5b50610e7688828901610d8c565b969995985093965092949392505050565b634e487b7160e01b600052604160045260246000fd5b6040516060810167ffffffffffffffff81118282101715610ec057610ec0610e87565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715610eef57610eef610e87565b604052919050565b600067ffffffffffffffff821115610f1157610f11610e87565b5060051b60200190565b6000610f2e610f2984610ef7565b610ec6565b83815260208082019190600586811b860136811115610f4c57600080fd5b865b8181101561105257803567ffffffffffffffff80821115610f6f5760008081fd5b818a01915060608236031215610f855760008081fd5b610f8d610e9d565b610f9683610d70565b81528683013560038110610faa5760008081fd5b8188015260408381013583811115610fc25760008081fd5b939093019236601f850112610fd957600092508283fd5b83359250610fe9610f2984610ef7565b83815292871b840188019288810190368511156110065760008081fd5b948901945b8486101561103b5785356001600160e01b03198116811461102c5760008081fd5b8252948901949089019061100b565b918301919091525088525050948301948301610f4e565b5092979650505050505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016110b3576110b361108b565b5060010190565b60005b838110156110d55781810151838201526020016110bd565b838111156107b25750506000910152565b600081518084526110fe8160208601602086016110ba565b601f01601f19169290920160200192915050565b60006060808301818452808751808352608092508286019150828160051b8701016020808b0160005b848110156111e157607f198a850301865281518885016001600160a01b038251168652848201516003811061118057634e487b7160e01b600052602160045260246000fd5b868601526040918201519186018a905281519081905290840190600090898701905b808310156111cc5783516001600160e01b03191682529286019260019290920191908601906111a2565b5097850197955050509082019060010161113b565b50506001600160a01b038a1690880152868103604088015261120381896110e6565b9a9950505050505050505050565b60006bffffffffffffffffffffffff8083168181036112325761123261108b565b6001019392505050565b6000825161124e8184602087016110ba565b9190910192915050565b60208152600061126b60208301846110e6565b9392505050565b6000828210156112845761128461108b565b500390565b634e487b7160e01b600052603160045260246000fdfe4c69624469616d6f6e644375743a205f696e6974206164647265737320686173206e6f20636f64654c69624469616d6f6e644375743a204e657720666163657420686173206e6f20636f6465a26469706673582212206cc792acb64c21764e52cc287ad2a0c1f623ba33a027bec5887940919e3fa7c764736f6c634300080f0033";

export class DiamondCut__factory extends ContractFactory {
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
  ): Promise<DiamondCut> {
    return super.deploy(overrides || {}) as Promise<DiamondCut>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): DiamondCut {
    return super.attach(address) as DiamondCut;
  }
  connect(signer: Signer): DiamondCut__factory {
    return super.connect(signer) as DiamondCut__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DiamondCutInterface {
    return new utils.Interface(_abi) as DiamondCutInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DiamondCut {
    return new Contract(address, _abi, signerOrProvider) as DiamondCut;
  }
}