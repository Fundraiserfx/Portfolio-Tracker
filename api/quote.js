export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  try {
    // Crypto: use Binance public API (no key needed)
    // Accepts formats: BINANCE:BTCUSDT or BTC-USD or BTCUSDT
    const isCrypto = symbol.startsWith('BINANCE:') || symbol.includes('-USD') || symbol.includes('USDT');

    if (isCrypto) {
      // Normalize to Binance symbol e.g. BINANCE:BTCUSDT -> BTCUSDT
      const binanceSymbol = symbol.replace('BINANCE:', '').replace('-USD', 'USDT');
      const [tickerRes, prevRes] = await Promise.all([
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`),
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
      ]);
      const ticker = await tickerRes.json();
      const prev = await prevRes.json();

      if (ticker.code) return res.status(200).json({ c: 0, error: ticker.msg });

      const current = parseFloat(ticker.price);
      const prevClose = parseFloat(prev.prevClosePrice);
      const change = current - prevClose;
      const changePct = ((change / prevClose) * 100);

      return res.status(200).json({
        c: current,
        o: parseFloat(prev.openPrice),
        h: parseFloat(prev.highPrice),
        l: parseFloat(prev.lowPrice),
        pc: prevClose,
        d: change,
        dp: changePct
      });
    }

    // Stocks: use Finnhub
    const key = process.env.VITE_FINNHUB_API_KEY;
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`
    );
    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price', detail: err.message });
  }
}
