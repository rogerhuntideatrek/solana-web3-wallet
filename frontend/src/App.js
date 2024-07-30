import React, { useState, useCallback } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

function App() {
  const { publicKey, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balanceError, setBalanceError] = useState(null);
  const [transactionError, setTransactionError] = useState(null);

  // Fetch balance when wallet is connected
  const fetchBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const response = await fetch(`/api/balance/${publicKey.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setBalance(data.balance);
        setBalanceError(null);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalanceError(error.message);
      }
    }
  }, [publicKey]);

  // Fetch transactions when wallet is connected
  const fetchTransactions = useCallback(async () => {
    if (publicKey) {
      try {
        const response = await fetch(`/api/transactions/${publicKey.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTransactions(data);
        setTransactionError(null);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactionError(error.message);
      }
    }
  }, [publicKey]);

  // Handles wallet connection and fetches balance and transactions
  const handleConnect = async () => {
    try {
      await connect();
      // Fetch data after successful connection
      fetchBalance();
      fetchTransactions();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className="App">
      <h1>Solana Wallet Integration</h1>
      <button onClick={handleConnect}>Connect Wallet</button>
      <button onClick={() => disconnect()}>Disconnect Wallet</button>
      {publicKey && (
        <div>
          <p>Connected Wallet: {publicKey.toString()}</p>
          {balanceError ? (
            <p>Error fetching balance: {balanceError}</p>
          ) : (
            <p>Balance: {balance ? `${balance / 1000000000} SOL` : 'Loading...'}</p>
          )}
          {transactionError ? (
            <p>Error fetching transactions: {transactionError}</p>
          ) : (
            <div>
              <h2>Recent Transactions</h2>
              <ul>
                {transactions.map(tx => (
                  <li key={tx.signature}>{tx.signature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Main() {
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={clusterApiUrl('mainnet-beta')}>
      <WalletProvider wallets={wallets}>
        <App />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default Main;
