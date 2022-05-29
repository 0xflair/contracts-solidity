const hre = require("hardhat");
const fs = require("fs");

const deployUpgradableContract = async (
  deployments,
  from,
  owner,
  name,
  args
) => {
  const { deploy } = deployments;

  const contract = await deploy(name, {
    from,
    log: true,
    proxy: {
      owner,
      proxyContract: "UUPSProxy",
      execute: {
        init: { methodName: "initialize", args },
      },
    },
    estimateGasExtra: 1000000,
  });

  if (hre.hardhatArguments.network === "hardhat") return contract;

  const proxyAbiPath = `${__dirname}/deployments/${hre.hardhatArguments.network}/${name}_Proxy.json`;
  const proxyContractAbi = JSON.parse(fs.readFileSync(proxyAbiPath, "utf8"));

  if (!proxyContractAbi.abi.find((i) => i.name && i.name === "upgradeTo")) {
    proxyContractAbi.abi.push(
      {
        inputs: [
          {
            internalType: "address",
            name: "newImplementation",
            type: "address",
          },
        ],
        name: "upgradeTo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newImplementation",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      }
    );

    fs.writeFileSync(proxyAbiPath, JSON.stringify(proxyContractAbi, null, 2));
  }

  return contract;
};

const deployPermanentContract = async (
  deployments,
  from,
  owner,
  name,
  args,
  additionalOptions = {}
) => {
  const { deploy } = deployments;
  const result = await deploy(name, {
    from,
    args,
    log: true,
    estimateGasExtra: 1000000,
    ...additionalOptions,
  });

  return hre.ethers.getContractAt(name, result.address);
};

module.exports = {
  deployUpgradableContract,
  deployPermanentContract,
};
