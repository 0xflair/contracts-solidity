import * as fse from 'fs-extra';
import glob from 'glob';
import hre from 'hardhat';
import * as path from 'path';
import * as rimraf from 'rimraf';

async function main() {
  const artifact = process.env.ARTIFACT;

  if (!artifact) {
    throw new Error('Missing ARTIFACT env variable');
  }

  await hre.deployments.fixture();

  const contract = await hre.ethers.getContract(artifact);

  const functionSignatures = Object.keys(contract.functions).filter((key) => key.endsWith(')'));

  console.log(JSON.stringify(functionSignatures, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
