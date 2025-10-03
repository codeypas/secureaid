const express = require("express")
const { ethers } = require("ethers")
const router = express.Router()

// Initialize provider (you'll need to configure this based on your network)
const getProvider = () => {
  const rpcUrl = process.env.RPC_URL || "http://localhost:8545"
  return new ethers.JsonRpcProvider(rpcUrl)
}

// GET /api/blockchain/network - Get network information
router.get("/network", async (req, res) => {
  try {
    const provider = getProvider()
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()

    res.json({
      success: true,
      data: {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        rpcUrl: process.env.RPC_URL || "http://localhost:8545",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching network information",
      error: error.message,
    })
  }
})

// GET /api/blockchain/transaction/:hash - Get transaction details
router.get("/transaction/:hash", async (req, res) => {
  try {
    const { hash } = req.params
    const provider = getProvider()

    const transaction = await provider.getTransaction(hash)
    const receipt = await provider.getTransactionReceipt(hash)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    res.json({
      success: true,
      data: {
        transaction: {
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: ethers.formatEther(transaction.value),
          gasLimit: transaction.gasLimit.toString(),
          gasPrice: transaction.gasPrice ? ethers.formatUnits(transaction.gasPrice, "gwei") : null,
          blockNumber: transaction.blockNumber,
          blockHash: transaction.blockHash,
          transactionIndex: transaction.index,
        },
        receipt: receipt
          ? {
              status: receipt.status,
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice
                ? ethers.formatUnits(receipt.effectiveGasPrice, "gwei")
                : null,
              logs: receipt.logs.length,
            }
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction details",
      error: error.message,
    })
  }
})

// GET /api/blockchain/address/:address - Get address information
router.get("/address/:address", async (req, res) => {
  try {
    const { address } = req.params

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum address",
      })
    }

    const provider = getProvider()
    const balance = await provider.getBalance(address)
    const transactionCount = await provider.getTransactionCount(address)

    res.json({
      success: true,
      data: {
        address,
        balance: ethers.formatEther(balance),
        transactionCount,
        isContract: (await provider.getCode(address)) !== "0x",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching address information",
      error: error.message,
    })
  }
})

// GET /api/blockchain/gas-price - Get current gas price
router.get("/gas-price", async (req, res) => {
  try {
    const provider = getProvider()
    const gasPrice = await provider.getFeeData()

    res.json({
      success: true,
      data: {
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : null,
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, "gwei") : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
          ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, "gwei")
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching gas price",
      error: error.message,
    })
  }
})

module.exports = router
