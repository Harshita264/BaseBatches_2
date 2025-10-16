"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useAccount, useBalance, useSignMessage } from "wagmi";
import { formatEther } from "viem";
import { useGreeter } from "../src/hooks/useGreeter";

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { signMessage, data: signature, isPending: isSignPending } = useSignMessage();
  const [message, setMessage] = useState("Hello from Base Sepolia!");

  const {
    greeting,
    refetchGreeting,
    readError,
    setGreeting,
    isWritePending,
    writeError,
    isConfirming,
    isConfirmed,
    confirmError,
  } = useGreeter();
  
  const [newGreeting, setNewGreeting] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isCorrectNetwork = chain?.id === 84532;

  useEffect(() => {
    if (isConfirmed) {
      refetchGreeting();
      setNewGreeting("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isConfirmed, refetchGreeting]);

  const handleSetGreeting = () => {
    if (newGreeting.trim()) {
      setGreeting(newGreeting);
    }
  };

  const handleSignMessage = () => {
    if (message) {
      signMessage({ message });
    }
  };

  const getButtonText = () => {
    if (isWritePending) return "Sending Transaction...";
    if (isConfirming) return "Confirming...";
    if (isConfirmed) return "✓ Updated!";
    return "Update Greeting";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Base Frontend Day 2</h1>
        <Wallet />
      </header>

      <main className={styles.main}>
        {isConnected && address ? (
          <>
            {!isCorrectNetwork && (
              <div className={styles.errorMessage}>
                <p>⚠️ Wrong Network! Please switch to Base Sepolia in your wallet.</p>
              </div>
            )}

            {showSuccess && (
              <div className={styles.successMessage}>
                <p>✓ Greeting updated successfully!</p>
              </div>
            )}

            <div className={styles.infoCard}>
              <div className={styles.infoSection}>
                <label className={styles.label}>Connected Address:</label>
                <p className={styles.address}>{address}</p>
              </div>

              <div className={styles.infoSection}>
                <label className={styles.label}>ETH Balance:</label>
                <p className={styles.balance}>
                  {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : "0 ETH"}
                </p>
              </div>
            </div>

            {/* Greeter Contract Section */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Greeter Contract</h2>
              
              <div className={styles.greetingDisplay}>
                <p className={styles.label}>Current Greeting:</p>
                <p className={styles.currentGreeting}>
                  {readError ? "Error loading greeting" : greeting || "Loading..."}
                </p>
                <button 
                  onClick={refetchGreeting} 
                  className={styles.refreshButton}
                  disabled={!isCorrectNetwork}
                >
                  🔄 Refresh
                </button>
              </div>

              <div className={styles.updateSection}>
                <p className={styles.label}>Update Greeting:</p>
                <input
                  type="text"
                  value={newGreeting}
                  onChange={(e) => setNewGreeting(e.target.value)}
                  className={styles.input}
                  placeholder="Enter new greeting..."
                  disabled={!isCorrectNetwork || isWritePending || isConfirming}
                />
                <button
                  onClick={handleSetGreeting}
                  disabled={!newGreeting.trim() || isWritePending || isConfirming || !isCorrectNetwork}
                  className={styles.button}
                >
                  {getButtonText()}
                </button>
                
                {writeError && (
                  <p className={styles.errorText}>
                    Error: {writeError.message.slice(0, 100)}...
                  </p>
                )}
                {confirmError && (
                  <p className={styles.errorText}>
                    Confirmation Error: {confirmError.message.slice(0, 100)}...
                  </p>
                )}
              </div>
            </div>

            {/* Sign Message Section */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Sign a Message (Gasless)</h2>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.input}
                placeholder="Enter message to sign"
              />

              <button
                onClick={handleSignMessage}
                disabled={isSignPending || !message}
                className={styles.button}
              >
                {isSignPending ? "Signing..." : "Sign Message"}
              </button>

              {signature && (
                <div className={styles.signatureSection}>
                  <label className={styles.label}>Signature:</label>
                  <p className={styles.signature}>{signature}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(signature)}
                    className={styles.copyButton}
                  >
                    📋 Copy Signature
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.connectPrompt}>
            <h2>Welcome to Base Frontend Day 2</h2>
            <p>Please connect your wallet to continue</p>
            <div className={styles.featureList}>
              <div className={styles.feature}>✓ View your wallet balance</div>
              <div className={styles.feature}>✓ Interact with Greeter contract</div>
              <div className={styles.feature}>✓ Sign messages gaslessly</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}