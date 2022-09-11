import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  const diamondCutFacet = await hre.ethers.getContract("DiamondCut");
  const diamondLoupeFacet = await hre.ethers.getContract("DiamondLoupe");
  const erc165Facet = await hre.ethers.getContract("ERC165");
  const ownableFacet = await hre.ethers.getContract("Ownable");
  const contextFacet = await hre.ethers.getContract("ERC2771Context");

  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "Diamond",
    [
      "0x0000000000000000000000000000000000000000", // owner
      diamondCutFacet.address,
      diamondLoupeFacet.address,
      erc165Facet.address,
      ownableFacet.address,
      contextFacet.address,
    ]
  );
};

export default func;
