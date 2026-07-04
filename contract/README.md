# Poll Smart Contract

A Soroban smart contract on Stellar testnet for live on-chain voting.

## Contract Functions

| Function | Description |
|---|---|
| `init(question)` | Initialize poll with a question |
| `vote(option)` | Vote for option 0-3 |
| `get_votes(option)` | Get vote count for option |
| `total_votes()` | Get total votes |
| `get_question()` | Get poll question |

## Options
- 0 = Stellar
- 1 = Ethereum  
- 2 = Bitcoin
- 3 = Cardano

## Deploy to Testnet
```bash
# Build
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm \
  --source deployer \
  --network testnet

# Initialize
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- init \
  --question "Which blockchain is best for payments?"
```

## Contract ID
Deployed on Stellar Testnet: `YOUR_CONTRACT_ID_HERE`
```

---

## Your final folder structure in VS Code:
```
live-poll/
├── contract/
│   ├── Cargo.toml        ✅ paste File 1
│   ├── README.md         ✅ paste File 3
│   └── src/
│       └── lib.rs        ✅ paste File 2
├── src/
│   ├── blockchain/
│   │   ├── contract.js
│   │   └── wallet.js
│   ├── components/
│   │   ├── PollSection.jsx
│   │   └── WalletSection.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
└── README.md