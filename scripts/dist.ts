import * as fse from "fs-extra";
import * as path from "path";
import * as rimraf from "rimraf";
import glob from "glob";

async function main() {
  const distPath = path.resolve(__dirname, "../dist");

  fse.mkdirSync(distPath, { recursive: true });

  fse.copySync(path.resolve(__dirname, "../contracts"), distPath);
  fse.copySync(
    path.resolve(__dirname, "../typechain"),
    distPath + "/typechain"
  );
  fse.copySync(
    path.resolve(__dirname, "../package.json"),
    distPath + "/package.json"
  );
  fse.copySync(
    path.resolve(__dirname, "../README.md"),
    distPath + "/README.md"
  );

  console.log(path.resolve(__dirname, "../artifacts/contracts"));

  const artifactsRoot = path.resolve(__dirname, "../artifacts/contracts");
  const files = glob.sync("**/*.json", {
    nodir: true,
    cwd: path.resolve(__dirname, "../artifacts/contracts"),
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

  rimraf.sync(path.resolve(distPath) + "/**/*.dbg.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
