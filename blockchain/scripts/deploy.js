const { ethers } = require("hardhat")

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("[v0] Deployer:", deployer.address)

  const Fundraising = await ethers.getContractFactory("Fundraising")
  const fundraising = await Fundraising.deploy(deployer.address)
  await fundraising.waitForDeployment()

  const address = await fundraising.getAddress()
  console.log("[v0] Fundraising deployed to:", address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
