/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IWithdrawExtension,
  IWithdrawExtensionInterface,
} from "../IWithdrawExtension";

const _abi = [
  {
    inputs: [],
    name: "lockWithdrawMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lockWithdrawRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "revokeWithdrawPower",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum WithdrawMode",
        name: "_withdrawMode",
        type: "uint8",
      },
    ],
    name: "setWithdrawMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_withdrawRecipient",
        type: "address",
      },
    ],
    name: "setWithdrawRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "claimTokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IWithdrawExtension__factory {
  static readonly abi = _abi;
  static createInterface(): IWithdrawExtensionInterface {
    return new utils.Interface(_abi) as IWithdrawExtensionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IWithdrawExtension {
    return new Contract(address, _abi, signerOrProvider) as IWithdrawExtension;
  }
}