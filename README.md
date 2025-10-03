# SecureAid Fundraising – Blockchain Module

A secure, transparent fundraising system for disaster relief built on Ethereum. It enables on-chain donations, live totals, donor visibility, and owner-only withdrawals to verified NGO/Govt wallets.

## Features
- Secure on-chain ETH donations via Solidity smart contracts
- Immutable ledger, donor address list, real-time total funds
- MetaMask wallet connection for donors and admins
- Owner-only withdraw to a verified beneficiary
- REST backend for campaign logs and analytics (MongoDB)
- Admin UI for monitoring and management

## Tech Stack
- Blockchain: Ethereum (Sepolia or local Hardhat)
- Smart Contracts: Solidity, OpenZeppelin Ownable + ReentrancyGuard
- Web3: ethers v6
- Frontend: Next.js App Router + Tailwind + shadcn (recommended), or React CRA (client/)
- Backend: Node.js + Express + MongoDB (Mongoose)
- Tooling: Hardhat

---

## 1) Prerequisites
- Node.js 18+ and VS Code
- MetaMask browser extension
- MongoDB running locally (or a MongoDB URI)
- Sepolia test ETH if deploying to testnet (get from a faucet)

---

## 2) Smart Contracts (Hardhat)

There are two Hardhat setups:
- Root Hardhat (contracts/ + hardhat.config.js)
- Standalone sample under blockchain/ (optional). Use only one.

Recommended: use the root Hardhat.

1. Copy environment file
   - cp .env.example .env
   - Fill:
     - SEPOLIA_RPC_URL=your Sepolia RPC (Infura/Alchemy, etc.)
     - PRIVATE_KEY=private key of your wallet with test ETH

2. Install deps at project root
   - npm install

3. Compile contracts
   - npx hardhat compile

4. Run a local node (optional)
   - npx hardhat node

5. Deploy
   - For local: npx hardhat run scripts/deploy.js --network localhost
   - For Sepolia: npx hardhat run scripts/deploy.js --network sepolia

6. Note the deployed contract address and update:
   - Next.js UI: create .env.local with:
     - NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
   - Server: server/.env (copy server/.env.example) with:
     - CONTRACT_ADDRESS=0xYourDeployedAddress

---

## 3) Backend (Express + MongoDB)

1. Create server/.env from server/.env.example and set:
   - MONGODB_URI=mongodb://localhost:27017/secureaid_fundraising (or your URI)
   - PORT=5000
   - FRONTEND_URL=http://localhost:3000
   - RPC_URL=http://localhost:8545 (or your Sepolia RPC)
   - CONTRACT_ADDRESS=0xYourDeployedAddress

2. Install server deps and start:
   - cd server
   - npm install
   - npm run dev
   - Health check: http://localhost:5000/health

3. Optional seed/migrate scripts (from project root):
   - node scripts/setup-database.js
   - node scripts/seed-sample-data.js

---

## 4) Frontend Options

You have two UIs. Pick one.

A) Next.js App (recommended; lives at app/*)
- At project root:
  - Create .env.local with:
    - NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
  - npm install (if not already)
  - npm run dev
  - Open http://localhost:3000
- Features present:
  - Connect Wallet, Donate ETH, Live Totals, Donor List
  - Admin Withdraw (auto-hides if not owner)

B) React CRA client (legacy) in client/
- cd client
- npm install
- npm run dev (or npm start)
- Open http://localhost:3000
- Proxy to http://localhost:5000 is set in client/package.json

Note: use only one frontend at a time on port 3000 to avoid conflicts.

---

## 5) Testing With Local Network (Optional)
- Terminal 1: npx hardhat node
- Terminal 2: npx hardhat run scripts/deploy.js --network localhost
- Import an account into MetaMask using a private key printed by the Hardhat node
- Set NEXT_PUBLIC_CONTRACT_ADDRESS to the local deployed address
- Start the UI and donate small test amounts

---

## 6) Admin Operations
- Admin = contract owner (deployer)
- Owner-only withdraw to a specified address from the Admin panel
- For production: verify the contract on Etherscan and use a hardware wallet for owner actions

---

## Troubleshooting
- MetaMask not detected: install the extension and refresh
- Missing NEXT_PUBLIC_CONTRACT_ADDRESS: set it in .env.local for Next.js
- Insufficient funds: acquire Sepolia ETH from a faucet when testing on testnet
- MongoDB connection errors: ensure MongoDB is running and MONGODB_URI is correct
- CORS errors: confirm FRONTEND_URL in server/.env matches your UI origin

---

## Scripts (root package.json)
- npm run dev           # concurrently starts server and client CRA (if you choose CRA)
- npx hardhat compile   # compile contracts
- npx hardhat node      # start local chain
- npx hardhat run scripts/deploy.js --network sepolia  # deploy to Sepolia

Use one frontend path (Next.js or client/) for clarity.
