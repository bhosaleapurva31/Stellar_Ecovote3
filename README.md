# 🌍 EcoVote — Stellar Eco-Impact Initiative

> Real-time decentralized voting platform for environmental projects, powered by Soroban Smart Contracts on the Stellar Blockchain.

---

## 🟡 Level 2 - Yellow Belt Submission

This project focuses on multi-wallet integration, Soroban testnet smart contract calling, real-time sync, transaction state monitoring, and robust error handling.

### ✅ Submission Checklist

- **Public GitHub Repository**: Configured and public.
- **README with Setup Instructions**: Documented below.
- **Minimum 2+ Meaningful Commits**: Staged and pushed.
- **Required Details**:
  - **Deployed Contract Address**: `CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV`
  - **Transaction Hash of a Contract Call (Stellar Explorer)**: `61cf6539b19e3d7a3cf9d92873bea7a4a9828e27dab2ea798522af4e6925c370`

---

## 📋 Deployed Contract Details

- **Target Network**: Stellar Testnet
- **EcoVote Poll Contract Address**:
  ```text
  CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV
  ```
- **View Contract on Stellar Expert**:  
  [Stellar Expert Contract Details](https://stellar.expert/explorer/testnet/contract/CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV)

- **Example Transaction Hash (Vote Call)**:  
  `61cf6539b19e3d7a3cf9d92873bea7a4a9828e27dab2ea798522af4e6925c370`
- **View Transaction on Stellar Explorer**:  
  [Stellar Expert Transaction Details](https://stellar.expert/explorer/testnet/tx/61cf6539b19e3d7a3cf9d92873bea7a4a9828e27dab2ea798522af4e6925c370)

---

## ✨ Features & Level 2 Requirements Met

### 1. Deployed Smart Contract Called from Frontend
- Fully integrates with the compiled and deployed Soroban Rust contract in `contract/src/lib.rs`.
- Reads option vote tallies using simulation calls (`simulateTransaction` via Soroban RPC).
- Writes votes using fully assembled on-chain transactions sent to the Stellar testnet ledger.

### 2. Multi-Wallet Integration
The DApp integrates with the four major browser-based wallets in the Stellar ecosystem:
- **Freighter Wallet**
- **xBull Wallet**
- **Lobstr Wallet**
- **Rabet Wallet**

*It detects available wallets automatically and prompts the user with detailed connection states.*

### 3. Handled Error Types (3 required)
- **User Transaction Rejection (Access Denied)**: Catches rejected signature requests inside the wallet popup and shows a helpful inline warning banner.
- **Insufficient XLM Funds**: Catches when an account does not have enough XLM to pay for transaction and ledger footprint fees.
- **Network Misconfiguration**: Identifies when the connected wallet is set to Stellar Mainnet (or another network) instead of Testnet and instructs the user to switch before reconnecting.

### 4. Live Transaction Status Visibility
- Users can track their transaction through sequential states:
  - `IDLE` / Not started.
  - `PENDING` (Awaiting user signature in wallet / submitting to testnet RPC).
  - `SUCCESS` (Confirmed on the Stellar ledger, triggering success burst).
  - `FAILED` (Soroban contract or consensus failure).

### 5. Real-Time Synchronization
- Pulls live ledger states every 10 seconds via RPC requests to ensure the UI remains synchronous with voter actions across the world.
- A live countdown timer updates the user on the next automatic synchronization event.

---

## 📁 Project Structure

```text
stellar-eco-vote/
├── contract/              # Soroban Smart Contract (Rust + Soroban SDK)
│   └── src/lib.rs         # Core contract code and unit tests
├── src/
│   ├── blockchain/
│   │   └── contract.js    # Stellar / Soroban SDK transaction building and calls
│   ├── components/
│   │   ├── PollSection.jsx   # Voting UI cards, donut chart, receipts list
│   │   └── WalletSection.jsx # Multi-wallet connector and modals
│   ├── walletKit.js       # Freighter, xBull, Lobstr, Rabet detection logic
│   ├── App.jsx            # Dashboard layout and page headers
│   └── App.css            # Custom CSS styling (Premium Carbon Theme)
└── README.md              # Documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed on your computer.
- A Stellar browser wallet extension installed (e.g., [Freighter Wallet](https://www.freighter.app/)).
- Switch your wallet extension to **Testnet** mode.
- Fund your testnet wallet address with free test XLM from the [Stellar Friendbot](https://friendbot.stellar.org).

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd stellar-live-poll
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:  
   Open your browser and navigate to `http://localhost:5173`.
