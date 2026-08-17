import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";

// Mock the contract module
vi.mock("./blockchain/contract", () => {
  return {
    CONTRACT_ID: "CABXIUP6FTYYHZKD7ZCASSMFKKUSXYNCPVKRBNCIXPUEPQ5C3ZWGZYTV",
    getVotes: vi.fn().mockResolvedValue(15),
    getBalance: vi.fn().mockResolvedValue("123.45"),
    submitVote: vi.fn().mockResolvedValue({ hash: "tx_hash_mock_123" }),
    waitForTransaction: vi.fn().mockResolvedValue({ status: "SUCCESS" }),
  };
});

// Mock the walletKit module
vi.mock("./walletKit", () => {
  return {
    connectWallet: vi.fn(),
    getInstalledWallets: vi.fn().mockReturnValue([
      { id: "freighter", name: "Freighter", installed: true, icon: "🛸" }
    ])
  };
});

describe("EcoVote App Tests", () => {
  it("renders the dashboard title and header successfully", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { name: /EcoVote Dashboard/i });
    expect(heading).toBeInTheDocument();
    
    const sub = screen.getByText(/Decentralized Governance for Stellar Community Green Initiatives/i);
    expect(sub).toBeInTheDocument();
  });

  it("displays the Connection Details panel in disconnected state", () => {
    render(<App />);
    const connectionHeader = screen.getByText(/Connection Details/i);
    expect(connectionHeader).toBeInTheDocument();
    
    const notConnectedText = screen.getByText(/Not connected/i);
    expect(notConnectedText).toBeInTheDocument();
  });

  it("renders the initiatives and option titles in the UI", () => {
    render(<App />);
    const oceanCleanHeader = screen.getByText(/Ocean Cleanup & Recovery/i);
    const forestHeader = screen.getByText(/Reforestation & Forestry/i);
    expect(oceanCleanHeader).toBeInTheDocument();
    expect(forestHeader).toBeInTheDocument();
  });

  it("renders the about section and how it works text", () => {
    render(<App />);
    const aboutTitle = screen.getByText(/About EcoVote/i);
    const stepText = screen.getByText(/Link your preferred browser wallet/i);
    expect(aboutTitle).toBeInTheDocument();
    expect(stepText).toBeInTheDocument();
  });
});
