const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Set up the Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');


// Endpoint Test
app.get('/test', async (req, res) => {
    return res.status(200).json({ message: 'Tested Checked' });
  });
  
// Endpoint to get the balance of a Solana wallet
app.get('/api/balance/:publicKey', async (req, res) => {
  const { publicKey } = req.params;
  try {
    if (!PublicKey.isOnCurve(publicKey)) {
      return res.status(400).json({ message: 'Invalid public key format.' });
    }
    const balance = await connection.getBalance(new PublicKey(publicKey));
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error.message);
    res.status(500).json({ message: `Error fetching balance: ${error.message}` });
  }
});

// Endpoint to get recent transactions of a Solana wallet
app.get('/api/transactions/:publicKey', async (req, res) => {
  const { publicKey } = req.params;
  try {
    if (!PublicKey.isOnCurve(publicKey)) {
      return res.status(400).json({ message: 'Invalid public key format.' });
    }
    const transactionList = await connection.getConfirmedSignaturesForAddress2(new PublicKey(publicKey));
    res.json(transactionList);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ message: `Error fetching transactions: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
