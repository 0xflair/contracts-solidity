import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployPermanentContract } from "../hardhat.util";
import { utils } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  // Deploy as master contract useful for EIP1167-based clones
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721HolderVestedDistributor",
    [
      {
        claimToken: "0x0000000000000000000000000000000000000000",
        ticketToken: "0x0000000000000000000000000000000000000000",
        vestingRate: utils.parseEther("1"),
        vestingTimeUnit: 60 * 60, // 1 hour
        claimStart: 0,
        claimEnd: 999999999999999,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721ShareholderDistributor",
    [
      {
        ticketToken: "0x0000000000000000000000000000000000000000",
        tokenIds: [],
        shares: [],
        lockedUntilTimestamp: 0,
      },
    ]
  );
};

export default func;
