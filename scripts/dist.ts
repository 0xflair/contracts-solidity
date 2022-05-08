import * as fse from "fs-extra";
import * as path from "path";
import * as rimraf from "rimraf";
import glob from "glob";

const {
  chainConfig,
} = require("@nomiclabs/hardhat-etherscan/dist/src/ChainConfig.js");

async function main() {
  const distPath = path.resolve(__dirname, "../dist");

  fse.mkdirSync(distPath, { recursive: true });

  // Add Solidity source code
  fse.copySync(path.resolve(__dirname, "../contracts"), distPath);

  // Add type bindings
  fse.copySync(
    path.resolve(__dirname, "../typechain"),
    distPath + "/typechain"
  );

  // Add ABI artifacts
  const artifactsRoot = path.resolve(__dirname, "../artifacts/contracts");
  const files = glob.sync("**/*.json", {
    nodir: true,
    cwd: artifactsRoot,
  });
  for (const file of files) {
    fse.copySync(
      path.resolve(artifactsRoot, file),
      path.resolve(
        distPath,
        path.dirname(path.dirname(file)),
        path.basename(file)
      )
    );
  }

  // Add OpenZeppelin ABI artifacts for convenience
  const ozRoot = path.resolve(
    __dirname,
    "../artifacts/@openzeppelin/contracts"
  );
  const ozFiles = glob.sync("**/*.json", {
    nodir: true,
    cwd: ozRoot,
  });
  for (const file of ozFiles) {
    fse.copySync(
      path.resolve(ozRoot, file),
      path.resolve(
        distPath + "/openzeppelin",
        path.dirname(path.dirname(file)),
        path.basename(file)
      )
    );
  }

  // Add Manifold.xyz ABI artifacts for convenience
  const manifoldRoot = path.resolve(
    __dirname,
    "../artifacts/@manifoldxyz/contracts"
  );
  const manifoldFiles = glob.sync("**/*.json", {
    nodir: true,
    cwd: manifoldRoot,
  });
  for (const file of manifoldFiles) {
    fse.copySync(
      path.resolve(manifoldRoot, file),
      path.resolve(
        distPath + "/manifoldxyz",
        path.dirname(path.dirname(file)),
        path.basename(file)
      )
    );
  }

  // Add deployment addresses
  const contractAddresses: Record<string, any> = {};
  const deploymentsRoot = path.resolve(__dirname, "../deployments");
  const deploymentFiles = glob.sync("*/*.json", {
    nodir: true,
    cwd: deploymentsRoot,
  });
  for (const file of deploymentFiles) {
    const chainName = path.dirname(file);

    if (!chainConfig[chainName]) {
      throw new Error(
        `Could not find ID for chain ${chainName} in chainConfig`
      );
    }

    const chainId = Number(chainConfig[chainName].chainId);

    if (!contractAddresses[chainId]) {
      contractAddresses[chainId] = {};
    }

    if (!contractAddresses[chainName]) {
      contractAddresses[chainName] = {};
    }

    const contractName = path.basename(file).split(".")[0];
    const contractAddress = (
      await fse.readJSON(path.resolve(deploymentsRoot, file))
    ).address;

    contractAddresses[chainId][contractName] = contractAddress;
    contractAddresses[chainName][contractName] = contractAddress;
  }

  fse.writeJSONSync(
    path.resolve(distPath, "addresses.json"),
    contractAddresses
  );

  // Remove debug files
  rimraf.sync(path.resolve(distPath) + "/**/*.dbg.json");

  // Add package files
  fse.copySync(
    path.resolve(__dirname, "../package.json"),
    distPath + "/package.json"
  );
  fse.copySync(
    path.resolve(__dirname, "../README.md"),
    distPath + "/README.md"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
