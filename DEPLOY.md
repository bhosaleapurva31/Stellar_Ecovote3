# 🚀 Soroban Contract Deploy Guide

## Prerequisites
```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Add WASM target
rustup target add wasm32-unknown-unknown

# 3. Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

## Build Contract
```bash
cd contract

# Build the WASM
stellar contract build

# Output: target/wasm32-unknown-unknown/release/poll_contract.wasm
```

## Deploy to Testnet

```bash
# Step 1: Create/fund a testnet account (if needed)
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

# Step 2: Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm \
  --source deployer \
  --network testnet

# ✅ Copy the CONTRACT_ID from output — looks like:
# CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Initialize Contract

```bash
# Replace YOUR_CONTRACT_ID and run:
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  init \
  --question "Which blockchain is best for payments?"
```

## Update Frontend

Open `src/blockchain/contract.js` and:

1. Replace `CONTRACT_ID`:
```js
export const CONTRACT_ID = "YOUR_CONTRACT_ID_HERE";
```

2. Set `useMock = false`:
```js
let useMock = false;  // ← change this line
```

## Test Contract Locally

```bash
cd contract
cargo test
```

Expected output:
```
running 1 test
test test::test_vote ... ok
test result: ok. 1 passed; 0 failed
```

## Verify on Explorer

After deploying, view your contract at:
```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```
