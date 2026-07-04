import { useState } from "react";
import WalletSection from "./components/WalletSection";
import PollSection from "./components/PollSection";
import { CONTRACT_ID } from "./blockchain/contract";
import "./App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <a className="nav-brand" href="#">
        <div className="nav-logo">🌱</div>
        <span className="nav-brand-name">EcoVote</span>
      </a>

      <div className="nav-links">
        <a className="nav-link active" href="#">Dashboard</a>
        <a className="nav-link" href="https://stellar.org/learn/intro-to-stellar" target="_blank" rel="noreferrer">
          Stellar Intro
        </a>
        <a className="nav-link" href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
          Contract <span className="nav-badge">TESTNET</span>
        </a>
      </div>

      <div className="nav-right">
        <div className="nav-status-dot" title="Testnet Online" />
        <div className="nav-network-pill">
          🌍 Stellar Testnet
        </div>
      </div>
    </nav>
  );
}

function ProjectInfo({ CONTRACT_ID }) {
  return (
    <div className="project-info">
      <div className="project-info-title">📖 About EcoVote</div>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-card-icon">⛓️</div>
          <div className="info-card-label">Blockchain</div>
          <div className="info-card-value">Stellar</div>
          <div className="info-card-sub">Soroban Smart Contract</div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">🌍</div>
          <div className="info-card-label">Focus Area</div>
          <div className="info-card-value">Eco-Impact</div>
          <div className="info-card-sub">Environmental funding vote</div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">🔐</div>
          <div className="info-card-label">Integrations</div>
          <div className="info-card-value">Multi-Wallet</div>
          <div className="info-card-sub">Freighter / xBull / Lobstr / Rabet</div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">📝</div>
          <div className="info-card-label">Status</div>
          <div className="info-card-value">Level 2</div>
          <div className="info-card-sub">On-Chain Event Sync</div>
        </div>
      </div>

      <div className="how-it-works">
        <div className="how-title">How It Works</div>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-num">1</div>
            <div className="step-text"><strong>Connect Wallet</strong> — Link your preferred browser wallet (Freighter, xBull, Lobstr, or Rabet) and select the Stellar Testnet.</div>
          </div>
          <div className="how-step">
            <div className="step-num">2</div>
            <div className="step-text"><strong>Select Initiative</strong> — Review the four core environmental initiatives and choose the one you believe should receive priority funding.</div>
          </div>
          <div className="how-step">
            <div className="step-num">3</div>
            <div className="step-text"><strong>Sign Transaction</strong> — Authorize the smart contract call. Your wallet will secure the on-chain vote using standard Soroban protocol.</div>
          </div>
          <div className="how-step">
            <div className="step-num">4</div>
            <div className="step-text"><strong>Real-time Sync</strong> — Once submitted, the vote is recorded on the Stellar ledger, updating the statistics immediately via live RPC synchronization.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastTx, setLastTx] = useState(null);

  return (
    <>
      <Navbar />

      <div className="app-root">
        <header className="app-header">
          <div className="header-leaf-icon">🍃</div>
          <h1>EcoVote Dashboard</h1>
          <p>Decentralized Governance for Stellar Community Green Initiatives</p>
          <div className="header-tags">
            <span className="htag blue">☘️ Carbon Conscious</span>
            <span className="htag cyan">🔗 Soroban Smart Contracts</span>
            <span className="htag green">⚡ Testnet Live</span>
          </div>
        </header>

        {error && (
          <div className="alert error" onClick={() => setError("")}>
            <div className="alert-content">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{error}</span>
            </div>
            <button className="alert-close">×</button>
          </div>
        )}
        
        {success && (
          <div className="alert success" onClick={() => setSuccess("")}>
            <div className="alert-content">
              <span className="alert-icon">✨</span>
              <span className="alert-message">{success}</span>
            </div>
            <button className="alert-close">×</button>
          </div>
        )}

        <WalletSection
          connectedWallet={connectedWallet}
          setConnectedWallet={setConnectedWallet}
          setBalance={setBalance}
          balance={balance}
          setError={setError}
          setSuccess={setSuccess}
        />

        <PollSection
          connectedWallet={connectedWallet}
          setError={setError}
          setSuccess={setSuccess}
          setLastTx={setLastTx}
        />

        <div className="info-panel">
          <h3>🔌 Connection Details</h3>
          <div className="info-row">
            <span>Selected Wallet</span>
            <span className="mono">
              {connectedWallet
                ? `${connectedWallet.walletIcon} ${connectedWallet.walletName} (${connectedWallet.address.slice(0,6)}...${connectedWallet.address.slice(-6)})`
                : "Not connected"}
            </span>
          </div>
          <div className="info-row">
            <span>Account Balance</span>
            <span>{balance ? balance + " XLM" : "—"}</span>
          </div>
          <div className="info-row">
            <span>Target Network</span>
            <span>Stellar Testnet</span>
          </div>
          <div className="info-row">
            <span>Contract Address</span>
            <span className="mono">{CONTRACT_ID.slice(0,8)}...{CONTRACT_ID.slice(-8)}</span>
          </div>
          {lastTx && (
            <div className="tx-box">
              <div>Last Transaction ID</div>
              <a href={`https://stellar.expert/explorer/testnet/tx/${lastTx}`} target="_blank" rel="noreferrer">
                {lastTx.slice(0,10)}...{lastTx.slice(-10)}
              </a>
            </div>
          )}
        </div>

        <ProjectInfo CONTRACT_ID={CONTRACT_ID} />
      </div>
    </>
  );
}