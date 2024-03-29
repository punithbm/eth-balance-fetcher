import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3000; // You can choose any available port

const ETH_RPC_URL = 'https://sepolia.base.org';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true';

async function fetchEthBalance(walletAddress) {
    const body = {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
        id: 1,
    };

    const response = await fetch(ETH_RPC_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    const balanceInEth = parseInt(data.result, 16);
    return balanceInEth;
}

async function fetchEthPrice() {
    try {
        const response = await fetch(COINGECKO_API_URL);
        const data = await response.json();
        return {
            usd: data.ethereum.usd,
            change_24h: data.ethereum.usd_24h_change,
        };
    } catch (error) {
        console.error("Error fetching ETH price:", error);
        return {
            usd: 0,
            change_24h: 0,
        };
    }
}

app.get('/address/balance/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const balance = await fetchEthBalance(walletAddress);
        const { usd, change_24h } = await fetchEthPrice();
        const quote = (balance / Math.pow(10, 18)) * usd;

        const result = {
            contract_name: "Ethereum",
            contract_ticker_symbol: "ETH",
            contract_decimals: 18,
            contract_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            coin: 8453,
            balance: balance.toString(),
            quote: quote.toString(),
            quote_rate: usd.toString(),
            logo_url: "https://assets.unmarshal.io/tokens/base_0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png",
            quote_rate_24h: change_24h.toString(),
            quote_pct_change_24h: change_24h,
            quote_price: quote.toString()
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
