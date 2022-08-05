import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { deployPermanentContract } from "../hardhat.util";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();

  // Deploy as master contract useful for EIP1167-based clones
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721EqualEmissionStream",
    [
      {
        ticketToken: "0x0000000000000000000000000000000000000000",
        lockedUntilTimestamp: 0,
        totalTickets: 0,
        emissionRate: 0,
        emissionTimeUnit: 0,
        emissionStart: 0,
        emissionEnd: 0,
        claimLockedUntil: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721ShareInstantStream",
    [
      {
        ticketToken: "0x0000000000000000000000000000000000000000",
        lockedUntilTimestamp: 0,
        tokenIds: [],
        shares: [],
        claimLockedUntil: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721LockedStakingEmissionStream",
    [
      {
        ticketToken: "0x0000000000000000000000000000000000000000",
        lockedUntilTimestamp: 0,
        minStakingDuration: 0,
        maxStakingTotalDurations: 0,
        emissionRate: 0,
        emissionTimeUnit: 0,
        emissionStart: 0,
        emissionEnd: 0,
        totalTickets: 0,
        claimLockedUntil: 0,
      },
    ]
  );
  await deployPermanentContract(
    hre.deployments,
    accounts[0],
    accounts[0],
    "ERC721CustodialStakingEmissionStream",
    [
      {
        ticketToken: "0x0000000000000000000000000000000000000000",
        lockedUntilTimestamp: 0,
        minStakingDuration: 0,
        maxStakingTotalDurations: 0,
        emissionRate: 0,
        emissionTimeUnit: 0,
        emissionStart: 0,
        emissionEnd: 0,
        totalTickets: 0,
        claimLockedUntil: 0,
      },
    ]
  );
};

export default func;
