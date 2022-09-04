import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments } from "hardhat";
import { TestERC20 } from "../typechain/TestERC20";
import { TestERC721 } from "../typechain/TestERC721";
import { FlairFactory } from "../typechain/FlairFactory";
import { FlairFactoryNewable } from "../typechain";

const { deployPermanentContract } = require("../hardhat.util");

type ContractDictionary = {
  [contractName: string]: {
    signer: SignerWithAddress;
    TestERC721: TestERC721;
    TestERC20: TestERC20;
    FlairFactory: FlairFactory;
    FlairFactoryNewable: FlairFactoryNewable;
  };
};

export const setupTest = deployments.createFixture(
  async ({ deployments, getUnnamedAccounts, ethers }, options) => {
    const accounts = await getUnnamedAccounts();

    await deployments.fixture();

    await deployPermanentContract(
      deployments,
      accounts[0],
      accounts[0],
      "TestERC721",
      []
    );

    await deployPermanentContract(
      deployments,
      accounts[0],
      accounts[0],
      "TestERC20",
      []
    );

    return {
      deployer: {
        signer: await ethers.getSigner(accounts[0]),
        TestERC721: await ethers.getContract("TestERC721", accounts[0]),
        TestERC20: await ethers.getContract("TestERC20", accounts[0]),
        FlairFactory: await ethers.getContract("FlairFactory", accounts[0]),
        FlairFactoryNewable: await ethers.getContract(
          "FlairFactoryNewable",
          accounts[0]
        ),
      },
      userA: {
        signer: await ethers.getSigner(accounts[1]),
        TestERC721: await ethers.getContract("TestERC721", accounts[1]),
        TestERC20: await ethers.getContract("TestERC20", accounts[1]),
        FlairFactory: await ethers.getContract("FlairFactory", accounts[1]),
        FlairFactoryNewable: await ethers.getContract(
          "FlairFactoryNewable",
          accounts[1]
        ),
      },
      userB: {
        signer: await ethers.getSigner(accounts[2]),
        TestERC721: await ethers.getContract("TestERC721", accounts[2]),
        TestERC20: await ethers.getContract("TestERC20", accounts[2]),
        FlairFactory: await ethers.getContract("FlairFactory", accounts[2]),
        FlairFactoryNewable: await ethers.getContract(
          "FlairFactoryNewable",
          accounts[2]
        ),
      },
      userC: {
        signer: await ethers.getSigner(accounts[3]),
        TestERC721: await ethers.getContract("TestERC721", accounts[3]),
        TestERC20: await ethers.getContract("TestERC20", accounts[3]),
        FlairFactory: await ethers.getContract("FlairFactory", accounts[3]),
        FlairFactoryNewable: await ethers.getContract(
          "FlairFactoryNewable",
          accounts[3]
        ),
      },
      userD: {
        signer: await ethers.getSigner(accounts[4]),
        TestERC721: await ethers.getContract("TestERC721", accounts[4]),
        TestERC20: await ethers.getContract("TestERC20", accounts[4]),
        FlairFactory: await ethers.getContract("FlairFactory", accounts[4]),
        FlairFactoryNewable: await ethers.getContract(
          "FlairFactoryNewable",
          accounts[4]
        ),
      },
    } as ContractDictionary;
  }
);
