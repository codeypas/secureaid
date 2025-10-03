const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying SecureAid Fundraising Contract...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  const SecureAidFundraising = await ethers.getContractFactory("SecureAidFundraising")
  const contract = await SecureAidFundraising.deploy()

  await contract.deployed()

  console.log("SecureAid Fundraising Contract deployed to:", contract.address)

  // Save contract address and ABI for frontend
  const fs = require("fs")
  const contractData = {
    address: contract.address,
    abi: contract.interface.format("json"),
  }

  fs.writeFileSync("./client/src/contracts/contract.json", JSON.stringify(contractData, null, 2))
  console.log("Contract data saved to client/src/contracts/contract.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
