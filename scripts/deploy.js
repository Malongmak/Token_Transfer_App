const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("Token");
  const initialSupply = 1000000;
  const token = await Token.deploy(initialSupply);

  await token.waitForDeployment(); // ✅ Use this instead of token.deployed()
  console.log(`Token deployed to: ${await token.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
