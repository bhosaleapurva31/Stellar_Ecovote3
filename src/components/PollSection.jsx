import { useState, useEffect, useCallback, useRef } from "react";
import { getVotes, submitVote, waitForTransaction, CONTRACT_ID, getPoints, REWARD_CONTRACT_ID } from "../blockchain/contract";

const OPTIONS = [
  { id: 0, name: "Ocean Cleanup & Recovery", short: "OCEAN", color: "#0ea5e9", icon: "🌊" },
  { id: 1, name: "Reforestation & Forestry", short: "FOREST", color: "#10b981", icon: "🌳" },
  { id: 2, name: "Solar Grid Infrastructure", short: "SOLAR", color: "#eab308", icon: "☀️" },
  { id: 3, name: "Wildlife & Habitat Protection", short: "WILD", color: "#f43f5e", icon: "🐾" },
];

function useAnimatedCount(target) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 20;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) { clearInterval(timer); prev.current = target; }
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return display;
}

function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => i);
  const colors = ["#0ea5e9", "#10b981", "#eab308", "#f43f5e", "#a78bfa", "#f472b6"];
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map((i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 100 + "%",
            background: colors[i % colors.length],
            animationDelay: (Math.random() * 0.5) + "s",
            animationDuration: (1.2 + Math.random() * 1) + "s",
            width: (6 + Math.random() * 6) + "px",
            height: (6 + Math.random() * 6) + "px",
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

function DonutChart({ votes, total }) {
  const size = 130;
  const r = 48;
  const cx = 65;
  const cy = 65;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = OPTIONS.map((opt, i) => {
    const pct = total > 0 ? votes[i] / total : 0.25;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { color: opt.color, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} className="donut-chart">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={s.dash + " " + s.gap}
          strokeDashoffset={-s.offset + circ * 0.25}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="8" letterSpacing="1">VOTES</text>
    </svg>
  );
}

function NetworkBadge() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return (
    <span className={online ? "net-badge online" : "net-badge offline"}>
      <span className="net-dot" />
      {online ? "Soroban RPC Connected" : "Offline"}
    </span>
  );
}

function Spinner() {
  return <span className="spinner" />;
}

function SuccessBurst({ option }) {
  return (
    <div className="burst-overlay">
      <Confetti />
      <div className="burst-icon">🌱</div>
      <div className="burst-text">Vote Recorded!</div>
      <div className="burst-sub">
        {"Your vote for " + (option || "") + " has been successfully finalized on-chain."}
      </div>
    </div>
  );
}

export default function PollSection({ connectedWallet, setError, setSuccess, setLastTx }) {
  const [votes, setVotes]                 = useState([0, 0, 0, 0]);
  const [txStatus, setTxStatus]           = useState(null);
  const [loadingOption, setLoadingOption] = useState(null);
  const [voted, setVoted]                 = useState(false);
  const [votedOption, setVotedOption]     = useState(null);
  const [showBurst, setShowBurst]         = useState(false);
  const [lastRefresh, setLastRefresh]     = useState(null);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [txHistory, setTxHistory]         = useState([]);
  const [showShare, setShowShare]         = useState(false);
  const [countdown, setCountdown]         = useState(10);
  const [copiedHash, setCopiedHash]       = useState(null);
  const [points, setPoints]               = useState(0);

  const totalVotes = votes.reduce((a, b) => a + b, 0);
  const animatedTotal = useAnimatedCount(totalVotes);

  const fetchPoints = useCallback(async () => {
    if (connectedWallet?.address) {
      try {
        const pts = await getPoints(connectedWallet.address);
        setPoints(pts);
      } catch (e) {
        console.error(e);
      }
    } else {
      setPoints(0);
    }
  }, [connectedWallet]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const fetchVotes = useCallback(async (silent) => {
    if (!silent) setIsRefreshing(true);
    const results = await Promise.all(
      OPTIONS.map(async (opt) => {
        try { return await getVotes(opt.id); } catch (e) { return 0; }
      })
    );
    setVotes(results);
    setLastRefresh(new Date());
    setCountdown(10);
    if (!silent) setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchVotes(false);
    const interval = setInterval(() => fetchVotes(true), 10000);
    return () => clearInterval(interval);
  }, [fetchVotes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 10 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVote = async (option) => {
    if (!connectedWallet) { setError("Please connect your Stellar wallet first."); return; }
    if (voted) { setError("You have already voted in this session!"); return; }
    setError("");
    setSuccess("Requesting signature from your Stellar wallet...");
    setLoadingOption(option.id);
    setTxStatus("pending");
    try {
      const response = await submitVote(option.id, connectedWallet.address, connectedWallet.signTransaction);
      setLastTx(response.hash);
      setSuccess("Submitting transaction to Stellar Testnet and awaiting validation...");
      const result = await waitForTransaction(response.hash);
      
      if (result && result.status === "SUCCESS") {
        setTxStatus("success");
        setVoted(true);
        setVotedOption(option.id);
        setSuccess("Success! Your vote is securely cast on the Stellar blockchain ledger.");
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 4000);
        
        setTxHistory((prev) => [
          { hash: response.hash, option: option.short, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 4)
        ]);
        
        setTimeout(() => {
          fetchVotes(false);
          fetchPoints();
        }, 2000);
      } else {
        setTxStatus("fail");
        setError("The Soroban transaction failed during ledger finalization.");
      }
    } catch (err) {
      setTxStatus("fail");
      setSuccess("");
      const msg = err && err.message ? err.message.toLowerCase() : "";
      if (msg.includes("rejected") || msg.includes("cancel") || msg.includes("declined")) {
        setError("Transaction rejected in your wallet browser extension.");
      } else if (msg.includes("insufficient")) {
        setError("Insufficient XLM balance to complete the transaction fees.");
      } else if (msg.includes("testnet") || msg.includes("empty xdr")) {
        setError("Please switch your wallet extension to Stellar Testnet and try again.");
      } else {
        setError(err && err.message ? err.message : "An unexpected transaction error occurred.");
      }
    } finally {
      setLoadingOption(null);
    }
  };

  const sorted = [...votes.map((v, i) => ({ id: i, votes: v }))].sort((a, b) => b.votes - a.votes);
  const leader = sorted[0].id;

  function getRank(id) { return sorted.findIndex((x) => x.id === id) + 1; }

  function getTxBadge() {
    if (txStatus === "pending") return <span className="tx-badge pending">⏳ Pending</span>;
    if (txStatus === "success") return <span className="tx-badge success">✅ Confirmed</span>;
    if (txStatus === "fail") return <span className="tx-badge fail">❌ Failed</span>;
    return null;
  }

  function handleShare() {
    const winner = OPTIONS[leader];
    const pct = totalVotes > 0 ? Math.round((votes[leader] / totalVotes) * 100) : 0;
    const text = "🌍 Voting for Stellar Eco-Impact: " + winner.name + " is leading with " + pct + "% votes! Cast your vote on-chain: " + window.location.href;
    if (navigator.share) {
      navigator.share({ title: "EcoVote Results", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  }

  function copyHash(hash) {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  }

  const refreshTime = lastRefresh ? lastRefresh.toLocaleTimeString() : "--";

  return (
    <div className="poll-card" style={{ position: "relative" }}>
      {showBurst && <SuccessBurst option={votedOption !== null ? OPTIONS[votedOption].name : ""} />}

      {connectedWallet && (
        <div className="rewards-banner" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(14,165,233,0.1))",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "16px",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>Eco-Governance Rewards</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Earned by participating in green voting initiatives</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "20px", fontWeight: "800", color: "#10b981", fontFamily: "monospace" }}>{points}</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginLeft: "4px" }}>VP</span>
          </div>
        </div>
      )}

      <div className="poll-header">
        <div>
          <div className="poll-title">Which environmental initiative should receive Stellar funding priority?</div>
          <NetworkBadge />
        </div>
        <div className="poll-header-right">
          <span className="countdown-badge">{"Syncing in " + countdown + "s"}</span>
          <button className="refresh-btn" onClick={() => fetchVotes(false)} disabled={isRefreshing}>
            {isRefreshing ? "..." : "Sync Now"}
          </button>
        </div>
      </div>

      <div className="poll-subtitle">
        {"On-chain ledger: "}<strong>{animatedTotal}</strong>{" total environmental votes "}
        {getTxBadge()}
      </div>

      <div className="chart-stats-row">
        <DonutChart votes={votes} total={totalVotes} />
        <div className="poll-stats-grid">
          <div className="poll-stat">
            <span className="stat-num">{animatedTotal}</span>
            <span className="stat-label">Total Votes</span>
          </div>
          <div className="poll-stat">
            <span className="stat-num">{OPTIONS[leader] ? OPTIONS[leader].short : "--"}</span>
            <span className="stat-label">Leading Option</span>
          </div>
          <div className="poll-stat">
            <span className="stat-num">{refreshTime}</span>
            <span className="stat-label">Last Checked</span>
          </div>
          <div className="poll-stat">
            <span className="stat-num">{txStatus ? txStatus.toUpperCase() : "IDLE"}</span>
            <span className="stat-label">Transaction State</span>
          </div>
        </div>
      </div>

      <div className="options-grid">
        {OPTIONS.map((opt) => {
          const count = votes[opt.id] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isLoading = loadingOption === opt.id;
          const isLeader = opt.id === leader && totalVotes > 0;
          const rank = getRank(opt.id);
          const isMyVote = votedOption === opt.id;

          return (
            <div key={opt.id} className={isLeader ? "poll-option leader" : "poll-option"}>
              <div className="vote-row">
                <div className="option-left">
                  <span className="rank-badge" style={{ background: rank === 1 ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.03)", color: rank === 1 ? "#eab308" : "#94a3b8" }}>
                    {"#" + rank}
                  </span>
                  <span className="option-short" style={{ background: opt.color + "18", color: opt.color }}>
                    {opt.icon} {opt.short}
                  </span>
                  <span className="option-name">{opt.name}</span>
                  {isLeader && totalVotes > 0 && <span className="leader-crown" title="Leader">👑</span>}
                  {isMyVote && <span className="my-vote-badge">My Choice ✅</span>}
                </div>
                <span className="option-pct" style={{ color: opt.color }}>{pct + "%"}</span>
              </div>

              <div className="progress">
                <div className="progress-bar" style={{ width: pct + "%", background: opt.color }} />
              </div>

              <div className="vote-meta">
                <span className="vote-count">{count + " votes"}</span>
                <button
                  className="vote-btn"
                  onClick={() => handleVote(opt)}
                  disabled={isLoading || loadingOption !== null || voted}
                  style={voted ? {} : { background: opt.color }}
                >
                  {isLoading ? <><Spinner /> Signing...</> : voted ? "Registered" : "Vote " + opt.short}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {voted && (
        <div className="share-row">
          <button className="share-btn" onClick={handleShare}>
            {showShare ? "Copied Results to Clipboard!" : "Share Voting Status"}
          </button>
        </div>
      )}

      {txHistory.length > 0 && (
        <div className="tx-history">
          <div className="tx-history-title">On-Chain Voting Ledger Receipts</div>
          {txHistory.map((tx, i) => {
            const url = "https://stellar.expert/explorer/testnet/tx/" + tx.hash;
            return (
              <div key={i} className="tx-history-row">
                <span className="tx-history-opt">{"Voted for " + tx.option}</span>
                <span className="tx-history-time">{tx.time}</span>
                <button className="copy-hash-btn" onClick={() => copyHash(tx.hash)}>
                  {copiedHash === tx.hash ? "Copied" : "Copy Hash"}
                </button>
                <a className="tx-history-link" href={url} target="_blank" rel="noreferrer">
                  View Explorer ↗
                </a>
              </div>
            );
          })}
        </div>
      )}

      <div className="contract-ref">
        {"Poll Smart Contract: " + CONTRACT_ID}
      </div>
    </div>
  );
}