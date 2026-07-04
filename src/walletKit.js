import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction as freighterSign,
} from "@stellar/freighter-api";

// Pre-detect on page load
let freighterDetected = false;
isConnected().then(res => {
  freighterDetected = res === true || res?.isConnected === true;
}).catch(() => {});

export const WALLETS = [
  {
    id: "freighter", name: "Freighter", icon: "🚀",
    installUrl: "https://www.freighter.app/",
    detect: () => {
      return !!(freighterDetected || window.freighter || window.freighterApi || window.stellar);
    },
  },
  {
    id: "xbull", name: "xBull Wallet", icon: "🐂",
    installUrl: "https://xbull.app/",
    detect: () => !!window.xBullSDK,
  },
  {
    id: "lobstr", name: "Lobstr", icon: "🦞",
    installUrl: "https://lobstr.co/",
    detect: () => !!window.lobstr,
  },
  {
    id: "rabet", name: "Rabet", icon: "🐰",
    installUrl: "https://rabet.io/",
    detect: () => !!window.rabet,
  },
];

export function getInstalledWallets() {
  return WALLETS.map((w) => ({ ...w, installed: w.detect() }));
}

export async function connectWallet(walletId) {
  switch (walletId) {
    case "freighter": return connectFreighter();
    case "xbull":     return connectXBull();
    case "lobstr":    return connectLobstr();
    case "rabet":     return connectRabet();
    default:          return { success: false, error: "UNKNOWN_WALLET" };
  }
}

async function connectFreighter() {
  try {
    await requestAccess();
    const addrRes = await getAddress();
    const address = typeof addrRes === "string" ? addrRes : addrRes?.address;
    if (!address) return { success: false, error: "ACCESS_DENIED" };

    const signTransaction = async (xdr, opts) => {
      console.log("🔐 Freighter signTransaction called — popup should appear...");
      const result = await freighterSign(xdr, {
        networkPassphrase: opts?.networkPassphrase || "Test SDF Network ; September 2015",
      });
      console.log("Freighter raw result:", JSON.stringify(result));
      if (typeof result?.signedTxXdr === "string" && result.signedTxXdr.length > 50)
        return result.signedTxXdr;
      if (typeof result === "string" && result.length > 50)
        return result;
      if (typeof result?.xdr === "string" && result.xdr.length > 50)
        return result.xdr;
      if (result?.signedTxXdr === "")
        throw new Error("Freighter returned empty XDR. Please switch to TESTNET in Freighter extension.");
      if (result?.error)
        throw new Error("Freighter error: " + JSON.stringify(result.error));
      throw new Error("Unexpected Freighter response: " + JSON.stringify(result));
    };

    return { success: true, walletId: "freighter", walletName: "Freighter", walletIcon: "🚀", address, signTransaction };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function connectXBull() {
  try {
    if (!window.xBullSDK) return { success: false, error: "WALLET_NOT_FOUND" };
    const address = await window.xBullSDK.getPublicKey();
    const signTransaction = async (xdr, opts) => {
      const res = await window.xBullSDK.signXDR(xdr, { networkPassphrase: opts?.networkPassphrase });
      return typeof res === "string" ? res : res?.xdr;
    };
    return { success: true, walletId: "xbull", walletName: "xBull", walletIcon: "🐂", address, signTransaction };
  } catch (err) { return { success: false, error: err.message }; }
}

async function connectLobstr() {
  try {
    if (!window.lobstr) return { success: false, error: "WALLET_NOT_FOUND" };
    const address = await window.lobstr.getPublicKey();
    const signTransaction = async (xdr) => {
      const res = await window.lobstr.signTransaction(xdr);
      return typeof res === "string" ? res : res?.xdr;
    };
    return { success: true, walletId: "lobstr", walletName: "Lobstr", walletIcon: "🦞", address, signTransaction };
  } catch (err) { return { success: false, error: err.message }; }
}

async function connectRabet() {
  try {
    if (!window.rabet) return { success: false, error: "WALLET_NOT_FOUND" };
    const address = await window.rabet.getPublicKey();
    const signTransaction = async (xdr, opts) => {
      const res = await window.rabet.sign(xdr, opts?.networkPassphrase);
      return typeof res === "string" ? res : res?.xdr;
    };
    return { success: true, walletId: "rabet", walletName: "Rabet", walletIcon: "🐰", address, signTransaction };
  } catch (err) { return { success: false, error: err.message }; }
}