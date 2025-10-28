import { ethers } from "hardhat";

async function main() {
  const SimpleVoting = await ethers.getContractFactory("SimpleVoting");
  const simpleVoting = await SimpleVoting.deploy();
  await simpleVoting.waitForDeployment();
  
  const address = await simpleVoting.getAddress();
  console.log(`SimpleVoting deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });