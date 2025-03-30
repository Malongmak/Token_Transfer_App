const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy Token Contract
  const Token = await hre.ethers.getContractFactory("Token");
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  const token = await Token.deploy(initialSupply);

  await token.waitForDeployment(); // ✅ Correct way to wait for deployment
  const tokenAddress = await token.getAddress();
  console.log(`✅ Token deployed to: ${tokenAddress}`);

  // Deploy WildlifeDonation Contract
  const WildlifeDonation = await hre.ethers.getContractFactory("WildlifeDonation");
  const donation = await WildlifeDonation.deploy(tokenAddress); // Pass token address to constructor

  await donation.waitForDeployment();
  const donationAddress = await donation.getAddress();
  console.log(`✅ WildlifeDonation deployed to: ${donationAddress}`);

  console.log("\n🎉 Deployment Successful!");
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`WildlifeDonation Address: ${donationAddress}`);
}

// Execute Deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
