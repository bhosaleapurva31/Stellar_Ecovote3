import { useState, useEffect } from "react";
import { connectWallet, getInstalledWallets } from "../walletKit";
import { getBalance } from "../blockchain/contract";

export default function WalletSection({
  connectedWallet,
  setConnectedWallet,
  setBalance,
  balance,
  setError,
  setSuccess,
}) {
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [wallets, setWallets]     = useState([]);

  useEffect(() => {
    if (showModal) {
      // Show instantly, then re-check after 500ms for async detection
      setWallets(getInstalledWallets());
      setTimeout(() => {
        setWallets(getInstalledWallets());
      }, 500);
    }
  }, [showModal]);

  useEffect(() => {
    if (connectedWallet?.address) {
      getBalance(connectedWallet.address)
        .then((bal) => setBalance(bal))
        .catch(() => setBalance("0.00"));
    }
  }, [connectedWallet, setBalance]);

  const handleConnect = async (wallet) => {
    setLoadingId(wallet.id);
    setError("");
    setSuccess("");

    const result = await connectWallet(wallet.id);

    if (result.success) {
      setConnectedWallet(result);
      setSuccess(`${result.walletName} connected!`);
      setShowModal(false);
    } else {
      if (!wallet.installed) {
        setError(`${wallet.name} is not installed. Please install and refresh page.`);
      } else {
        const errMap = {
          WALLET_NOT_FOUND: `${wallet.name} not found. Please refresh page.`,
          ACCESS_DENIED:    "Connection rejected.",
          UNKNOWN_WALLET:   "Unknown wallet.",
        };
        setError(errMap[result.error] || `Error: ${result.error}`);
      }
    }
    setLoadingId(null);
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    setBalance(null);
    setSuccess("Wallet disconnected.");
  };

  return (
    <>
      <div className="wallet-bar">
        {connectedWallet ? (
          <div className="connected-badge">
            <span>
              {connectedWallet.walletIcon} {connectedWallet.walletName} &middot;{" "}
              {connectedWallet.address.slice(0, 6)}...
              {connectedWallet.address.slice(-6)}
              {balance !== null && (
                <span className="balance-tag"> &middot; {balance} XLM</span>
              )}
            </span>
            <button className="disconnect-btn" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-btn" onClick={() => setShowModal(true)}>
            Connect Wallet
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Choose a Wallet</h3>
            <p className="modal-subtitle">Connect your Stellar wallet to vote</p>

            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                className={`wallet-option ${!wallet.installed ? "not-installed" : ""}`}
                onClick={() => handleConnect(wallet)}
                disabled={!!loadingId}
              >
                <span className="wallet-name">{wallet.icon} {wallet.name}</span>
                <span className="wallet-action">
                  {loadingId === wallet.id
                    ? "Connecting..."
                    : wallet.installed ? "Connect →" : "Install ↗"}
                </span>
              </button>
            ))}

            <button className="modal-close" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}