# 🌍 EcoVote — Stellar Eco-Impact Initiative

> Real-time decentralized voting platform for environmental projects, powered by Soroban Smart Contracts on the Stellar Blockchain.

---

## 🌐 Live Demo
👉 **[https://stellar-ecovote.vercel.app/](https://stellar-ecovote.vercel.app/)**

## 🎥 Demo Video
👉 **[EcoVote Demo Video (Loom)](https://www.loom.com/share/ba23474ef78446189942ddacc8e1d65d)**

---

## 🟢 Level 3 - Advanced Smart Contracts + Production-Ready dApp

This project incorporates advanced smart contract patterns, inter-contract communication, unit testing for both Rust contracts and React frontend components, CI/CD pipeline automation, and production-ready architecture practices.

### ✅ Level 3 Requirements Met

- **Advanced Smart Contracts**: Restructured `contract/src/lib.rs` to include a dual-contract architecture (`PollContract` and `VoterRewardContract`).
- **Inter-Contract Communication**: The `PollContract` executes a cross-contract call using `VoterRewardContractClient` to award voting points (`VP`) to voters dynamically upon successful on-chain vote submissions.
- **Access Control & Safety**: On-chain double voting check prevents duplicate calls. `VoterRewardContract` ensures only the authorized `PollContract` (admin) is permitted to call the `award_points` function using explicit Soroban authentication `require_auth()`.
- **Unit Testing**:
  - **Smart Contract (Rust)**: Automated tests validating initialization, cross-contract point assignment, double-voting prevention, and access control.
  - **Frontend (Vitest + JSDOM)**: Mocked SDK layers and verified component rendering, connection states, and UI flows.
- **CI/CD Pipeline**: Configured GitHub Actions workflow to run build, linting checks, Rust unit tests, and React component tests on every commit/PR.
- **Vibrant UI & Rewards Panel**: Integrated a dedicated, responsive rewards dashboard banner showing user points loaded directly from the reward smart contract.

---

## 📋 Deployed Contract Details

- **Target Network**: Stellar Testnet
- **EcoVote Poll Contract Address**:
  ```text
  CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV
  ```
- **Voter Reward Contract Address**:
  ```text
  CC3REWARD5FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGVIP
  ```
- **View Poll Contract on Stellar Expert**:  
  [Stellar Expert Poll Contract](https://stellar.expert/explorer/testnet/contract/CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV)

---

## 📁 Project Structure

```text
stellar-eco-vote/
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline running Rust & JS tests
├── contract/              # Soroban Smart Contract (Rust + Soroban SDK)
│   ├── src/lib.rs         # Dual-contract implementation and Rust tests
│   └── Cargo.toml         # Contract dependencies & profile
├── src/
│   ├── blockchain/
│   │   └── contract.js    # Stellar / Soroban SDK transaction building and calls
│   ├── components/
│   │   ├── PollSection.jsx   # Voting UI cards, donut chart, receipts list, rewards banner
│   │   └── WalletSection.jsx # Multi-wallet connector and modals
│   ├── test/
│   │   └── setup.js       # Vitest global testing setup
│   ├── App.jsx            # Dashboard layout and page headers
│   ├── App.test.jsx       # Frontend unit tests for UI rendering and simulation
│   └── App.css            # Custom CSS styling (Premium Carbon Theme)
└── README.md              # Documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed on your computer.
- Rust and Cargo (optional, for contract unit tests).
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
   npm install --legacy-peer-deps
   ```

3. **Run smart contract tests**:
   ```bash
   cd contract
   cargo test
   cd ..
   ```

4. **Run frontend tests**:
   ```bash
   npm run test
   ```

5. **Run local development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:  
   Open your browser and navigate to `http://localhost:5173`.

---

## 🖼️ Screenshots

- **CI/CD Pipeline Running**:
  ![CI/CD Pipeline](./CI_CD_Pipeline.png)
- **Frontend Test Suite Passing**: 
  ![Test Output](./Test%20Output.png)
  ```text
  ✓ src/App.test.jsx  (4 tests)
  Tests  4 passed (4)
  ```

### 💳 Wallet Options Available
![Wallet Options](./Wallet%20Options%20Available.png)

### ⏳ Transaction Processing
![Transaction Processing](./⏳%20Transaction%20Processing.png)

### ✅ Transaction Success + Voting UI
![Transaction Success](./Transaction%20Success%20+%20Voting%20UI.png)

### 🔍 Transaction Hash on Stellar Explorer
![Transaction Hash](./Transaction%20Hash%20on%20Stellar%20Explorer.png)
