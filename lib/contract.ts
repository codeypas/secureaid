export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""

export const CONTRACT_ABI = [
  // donate()
  {
    type: "function",
    name: "donate",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  // getTotalFunds() view returns (uint256)
  {
    type: "function",
    name: "getTotalFunds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // getDonorList() view returns (address[])
  {
    type: "function",
    name: "getDonorList",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  // withdrawFunds(address)
  {
    type: "function",
    name: "withdrawFunds",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: [],
  },
  // events
  {
    type: "event",
    name: "DonationReceived",
    inputs: [
      { indexed: true, name: "donor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FundsWithdrawn",
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    anonymous: false,
  },
] as const
