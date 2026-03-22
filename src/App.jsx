import { useState, useEffect } from "react";

const INITIAL_PORTFOLIO = [
  { ticker: "NVDA",    shares: 0, buyPrice: 0 },
  { ticker: "AMD",     shares: 0, buyPrice: 0 },
  { ticker: "GOOGL",   shares: 0, buyPrice: 0 },
  { ticker: "VOO",     shares: 0, buyPrice: 0 },
  { ticker: "DXYZ",    shares: 0, buyPrice: 0 },
  { ticker: "POET",    shares: 0, buyPrice: 0 },
  { ticker: "BTCUSDT", shares: 0, buyPrice: 0 },
  { ticker: "XRPUSDT", shares: 0, buyPrice: 0 },
];

const FINNHUB_KEY = "YOUR_FINNHUB_KEY_HERE";

const fmt = (n) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n) => (n >= 0 ? "+" : "") + n?.toFixed(2) + "%";
const fmtDollar = (n) => (n >= 0 ? "+$" : "-$") + Math.abs(n)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = ["#c9a84c", "#4ade80", "#60a5fa", "#f59e0b", "#a78bfa", "#f472b6", "#34d399", "#fb923c"];

// Donut Chart Component
const DonutChart = ({ slices, total }) => {
  const [hovered, setHovered] = useState(null);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 85;
  const inner = 54;

  let cumAngle = -Math.PI / 2;
  const paths = slices.map((s, i) => {
    const angle = (s.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const xi1 = cx + inner * Math.cos(cumAngle);
    const yi1 = cy + inner * Math.sin(cumAngle);
    const xi2 = cx + inner * Math.cos(cumAngle + angle);
    const yi2 = cy + inner * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = cumAngle + angle / 2;
    const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    cumAngle += angle;
    return { path, color: COLORS[i % COLORS.length], ticker: s.ticker, value: s.value, pct: (s.value / total * 100).toFixed(1), midAngle };
  });

  const active = hovered !== null ? paths[hovered] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color}
            opacity={hovered === null ? 1 : hovered === i ? 1 : 0.25}
            style={{ cursor: "pointer", transition: "opacity 0.2s, transform 0.2s" }}
            transform={hovered === i ? `translate(${Math.cos(p.midAngle) * 7}, ${Math.sin(p.midAngle) * 7})` : ""}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={cx} y={cy - 12} textAnchor="middle" fill={active ? active.color : "#c9a84c"} fontSize="13" fontFamily="monospace" fontWeight="700">
          {active ? active.ticker : "TOTAL"}
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fill="#e8d5a3" fontSize="12" fontFamily="monospace">
          {active ? `$${fmt(active.value)}` : `$${fmt(total)}`}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fill={active ? active.color : "#555"} fontSize="11" fontFamily="monospace">
          {active ? `${active.pct}% of portfolio` : "total invested"}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {paths.map((p, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", background: hovered === i ? "#111" : "#0a0a0a", border: "1px solid", borderColor: hovered === i ? p.color + "44" : "#141414", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: p.color, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "13px", fontFamily: "monospace", color: "#888", fontWeight: "700" }}>{p.ticker}</div>
            <div style={{ fontSize: "13px", fontFamily: "monospace", color: p.color, fontWeight: "700", minWidth: "45px", textAlign: "right" }}>{p.pct}%</div>
            <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#555", minWidth: "80px", textAlign: "right" }}>${fmt(p.value)}</div>
          </div>
        ))}
        {/* Total row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: "#0c0c0c", border: "1px solid #2a2a2a", marginTop: "4px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#333", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: "13px", fontFamily: "monospace", color: "#555", fontWeight: "700" }}>TOTAL</div>
          <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#555", minWidth: "45px", textAlign: "right" }}>100%</div>
          <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#c9a84c", fontWeight: "700", minWidth: "80px", textAlign: "right" }}>${fmt(total)}</div>
        </div>
      </div>
    </div>
  );
};

export default function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState(() => {
  try {
    const saved = localStorage.getItem('vault_portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  } catch { return INITIAL_PORTFOLIO; }
});
  const [prices, setPrices] = useState({});useEffect(() => {
  try { localStorage.setItem('vault_portfolio', JSON.stringify(portfolio)); } catch {}
}, [portfolio]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tab, setTab] = useState("portfolio");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [addForm, setAddForm] = useState({ ticker: "", shares: "", buyPrice: "" });
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    const newPrices = {};
    try {
      await Promise.all(portfolio.map(async (pos) => {
        const res = await fetch(`/api/quote?symbol=${pos.ticker}`);
        const data = await res.json();
        if (data.c) newPrices[pos.ticker] = { current: data.c, open: data.o, high: data.h, low: data.l, prevClose: data.pc, change: data.d, changePct: data.dp };
      }));
      setPrices(newPrices);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError("Failed to fetch prices. Check your Finnhub API key.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrices(); }, [portfolio.length]);

  const totalValue = portfolio.reduce((sum, p) => sum + (p.shares * (prices[p.ticker]?.current || 0)), 0);
  const totalCost = portfolio.reduce((sum, p) => sum + (p.shares * p.buyPrice), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const dayChange = portfolio.reduce((sum, p) => sum + (p.shares * (prices[p.ticker]?.change || 0)), 0);

  // Chart slices based on amount invested per position
  const chartSlices = portfolio
    .map(p => ({ ticker: p.ticker, value: p.shares * p.buyPrice }))
    .filter(s => s.value > 0);

  const startEdit = () => {
    const d = {};
    portfolio.forEach(p => { d[p.ticker] = { shares: p.shares, buyPrice: p.buyPrice }; });
    setEditData(d);
    setEditMode(true);
  };

  const saveEdit = () => {
    setPortfolio(prev => prev.map(p => ({
      ...p,
      shares: parseFloat(editData[p.ticker]?.shares) || p.shares,
      buyPrice: parseFloat(editData[p.ticker]?.buyPrice) || p.buyPrice,
    })));
    setEditMode(false);
  };

  const addPosition = () => {
    if (!addForm.ticker || !addForm.shares || !addForm.buyPrice) return;
    const ticker = addForm.ticker.toUpperCase();
    setPortfolio(prev => [...prev, { ticker, shares: parseFloat(addForm.shares), buyPrice: parseFloat(addForm.buyPrice) }]);
    setAddForm({ ticker: "", shares: "", buyPrice: "" });
  };

  const removePosition = (ticker) => setPortfolio(prev => prev.filter(p => p.ticker !== ticker));

  const inp = { background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#e8d5a3", padding: "6px 10px", fontSize: "12px", fontFamily: "monospace", outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#080808", color: "#e8d5a3", fontFamily: "'Courier New', monospace", backgroundImage: "radial-gradient(ellipse at 0% 0%, #1a1200 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, #0a0f00 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&family=Syne:wght@400;600;800&display=swap');
        html, body { margin: 0; padding: 0; width: 100%; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #333; }
        .row-hover:hover { background: #111 !important; }
        .tab-btn { transition: all 0.2s; }
        input:focus { border-color: #c9a84c !important; }
        .refresh-btn:hover { background: #c9a84c22 !important; }
        .action-btn:hover { opacity: 0.7; }
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .min-table { min-width: 560px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2px" }}>Investor Vault</div>
            <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontFamily: "'Syne', sans-serif", fontWeight: "800", letterSpacing: "-0.02em", color: "#e8d5a3" }}>PORTFOLIO</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Value</div>
            <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontFamily: "monospace", color: "#c9a84c" }}>${fmt(totalValue)}</div>
            <div style={{ fontSize: "11px", color: totalGain >= 0 ? "#4ade80" : "#ef4444", fontFamily: "monospace" }}>
              {fmtDollar(totalGain)} ({fmtPct(totalGainPct)}) all time
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ borderBottom: "1px solid #1a1a1a", background: "#0c0c0c" }}>
        <div style={{ padding: "10px 16px", display: "flex", gap: "16px", alignItems: "center", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.15em" }}>Day P&L</div>
            <div style={{ fontSize: "13px", fontFamily: "monospace", color: dayChange >= 0 ? "#4ade80" : "#ef4444", fontWeight: "700" }}>{fmtDollar(dayChange)}</div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.15em" }}>Total Invested</div>
            <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#c9a84c" }}>${fmt(totalCost)}</div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.15em" }}>Positions</div>
            <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#888" }}>{portfolio.length}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            {lastUpdated && <div style={{ fontSize: "9px", color: "#333", whiteSpace: "nowrap" }}>Updated {lastUpdated}</div>}
            <button className="refresh-btn" onClick={fetchPrices} disabled={loading} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#888", cursor: "pointer", fontSize: "11px", fontFamily: "monospace", whiteSpace: "nowrap" }}>
              {loading ? "..." : "⟳ Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ width: "100%", padding: "10px 16px 0" }}>
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #1e1e1e", marginBottom: "16px", overflowX: "auto" }}>
          {[["portfolio", "Holdings"], ["chart", "Allocation"], ["add", "+ Add"]].map(([key, label]) => (
            <button key={key} className="tab-btn" onClick={() => setTab(key)} style={{ padding: "8px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "11px", fontFamily: "monospace", color: tab === key ? "#c9a84c" : "#444", borderBottom: tab === key ? "2px solid #c9a84c" : "2px solid transparent", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</button>
          ))}
          {tab === "portfolio" && (
            <button className="tab-btn" onClick={editMode ? saveEdit : startEdit} style={{ marginLeft: "auto", padding: "6px 14px", border: `1px solid ${editMode ? "#4ade80" : "#2a2a2a"}`, borderRadius: "6px", background: editMode ? "#4ade8022" : "transparent", cursor: "pointer", fontSize: "11px", fontFamily: "monospace", color: editMode ? "#4ade80" : "#555", marginBottom: "2px", whiteSpace: "nowrap" }}>
              {editMode ? "✓ Save" : "✎ Edit"}
            </button>
          )}
        </div>

        {error && <div style={{ padding: "10px 14px", background: "#1a0000", border: "1px solid #330000", borderRadius: "8px", color: "#ef4444", fontSize: "12px", marginBottom: "16px" }}>{error}</div>}

        {/* HOLDINGS TAB */}
        {tab === "portfolio" && (
          <div>
            <div className="table-wrap">
              <div className="min-table">
                <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr 1fr 1fr 70px", gap: "8px", padding: "6px 10px", marginBottom: "4px" }}>
                  {["Ticker", "Current", "Buy Price", "Invested", "Gain/Loss", "Value", "Shares"].map(h => (
                    <div key={h} style={{ fontSize: "9px", color: "#333", textTransform: "uppercase", letterSpacing: "0.12em" }}>{h}</div>
                  ))}
                </div>

                {portfolio.map((pos) => {
                  const p = prices[pos.ticker];
                  const current = p?.current || 0;
                  const gain = (current - pos.buyPrice) * pos.shares;
                  const gainPct = pos.buyPrice > 0 ? ((current - pos.buyPrice) / pos.buyPrice) * 100 : 0;
                  const value = current * pos.shares;
                  const invested = pos.shares * pos.buyPrice;
                  const isUp = gain >= 0;

                  return (
                    <div key={pos.ticker} className="row-hover" style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr 1fr 1fr 70px", gap: "8px", padding: "12px 10px", borderRadius: "8px", marginBottom: "4px", background: "#0a0a0a", border: "1px solid #141414", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "'Syne', sans-serif", color: "#e8d5a3" }}>{pos.ticker}</div>
                        {p && <div style={{ fontSize: "9px", color: p.changePct >= 0 ? "#4ade80" : "#ef4444", marginTop: "2px" }}>{p.changePct >= 0 ? "▲" : "▼"} {Math.abs(p.changePct?.toFixed(2))}% today</div>}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "13px", color: current > 0 ? "#e8d5a3" : "#333" }}>{current > 0 ? `$${fmt(current)}` : "—"}</div>
                      {editMode ? (
                        <input type="number" value={editData[pos.ticker]?.buyPrice || ""} onChange={e => setEditData(prev => ({ ...prev, [pos.ticker]: { ...prev[pos.ticker], buyPrice: e.target.value } }))} style={{ ...inp, width: "80px" }} placeholder="Buy $" />
                      ) : (
                        <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#666" }}>${fmt(pos.buyPrice)}</div>
                      )}
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888" }}>${fmt(invested)}</div>
                        <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>{pos.shares} × ${fmt(pos.buyPrice)}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: isUp ? "#4ade80" : "#ef4444", fontWeight: "700" }}>{fmtDollar(gain)}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: isUp ? "#4ade8088" : "#ef444488" }}>{fmtPct(gainPct)}</div>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#c9a84c" }}>${fmt(value)}</div>
                      {editMode ? (
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <input type="number" value={editData[pos.ticker]?.shares || ""} onChange={e => setEditData(prev => ({ ...prev, [pos.ticker]: { ...prev[pos.ticker], shares: e.target.value } }))} style={{ ...inp, width: "50px" }} placeholder="#" />
                          <button className="action-btn" onClick={() => removePosition(pos.ticker)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px", padding: "0 2px" }}>×</button>
                        </div>
                      ) : (
                        <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#666" }}>{pos.shares}</div>
                      )}
                    </div>
                  );
                })}

                {/* Total Footer */}
                <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr 1fr 1fr 70px", gap: "8px", padding: "12px 10px", borderRadius: "8px", background: "#0c0c0c", border: "1px solid #1e1e1e", marginTop: "8px" }}>
                  <div style={{ fontSize: "11px", color: "#555", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>TOTAL</div>
                  <div /><div />
                  <div>
                    <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#c9a84c", fontWeight: "700" }}>${fmt(totalCost)}</div>
                    <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>Total Invested</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontFamily: "monospace", color: totalGain >= 0 ? "#4ade80" : "#ef4444", fontWeight: "700" }}>{fmtDollar(totalGain)}</div>
                    <div style={{ fontSize: "9px", color: totalGain >= 0 ? "#4ade8066" : "#ef444466", marginTop: "1px" }}>{fmtPct(totalGainPct)}</div>
                  </div>
                  <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#c9a84c", fontWeight: "700" }}>${fmt(totalValue)}</div>
                  <div />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALLOCATION CHART TAB */}
        {tab === "chart" && (
          <div>
            <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "20px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Portfolio Allocation</div>
                {lastUpdated && <div style={{ fontSize: "10px", color: "#333", fontFamily: "monospace" }}>Updated {lastUpdated}</div>}
              </div>
              <div style={{ fontSize: "11px", color: "#333", marginBottom: "24px" }}>Based on amount invested · Tap to inspect</div>
              {chartSlices.length > 0 ? (
                <DonutChart slices={chartSlices} total={totalCost} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#333", fontSize: "13px" }}>
                  No positions with data yet.<br />
                  <span style={{ color: "#555" }}>Add shares and buy prices to see the chart.</span>
                </div>
              )}
            </div>
            {chartSlices.length === 0 && (
              <div style={{ marginTop: "12px", padding: "16px", background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: "10px" }}>
                <div style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Preview with sample data</div>
                <DonutChart
                  slices={[
                    { ticker: "NVDA", value: 4500 },
                    { ticker: "VOO", value: 3200 },
                    { ticker: "AMD", value: 1800 },
                    { ticker: "GOOGL", value: 2100 },
                    { ticker: "DXYZ", value: 800 },
                    { ticker: "POET", value: 600 },
                  ]}
                  total={13000}
                />
              </div>
            )}
          </div>
        )}

        {/* ADD POSITION TAB */}
        {tab === "add" && (
          <div style={{ paddingBottom: "40px" }}>
            <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>New Position</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#444", marginBottom: "5px", letterSpacing: "0.1em" }}>TICKER SYMBOL</div>
                  <input placeholder="e.g. AAPL or BINANCE:BTCUSDT" value={addForm.ticker} onChange={e => setAddForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} style={inp} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#444", marginBottom: "5px", letterSpacing: "0.1em" }}>SHARES OWNED</div>
                    <input type="number" placeholder="0.00" value={addForm.shares} onChange={e => setAddForm(p => ({ ...p, shares: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#444", marginBottom: "5px", letterSpacing: "0.1em" }}>AVG BUY PRICE ($)</div>
                    <input type="number" placeholder="0.00" value={addForm.buyPrice} onChange={e => setAddForm(p => ({ ...p, buyPrice: e.target.value }))} style={inp} />
                  </div>
                </div>
                <button onClick={addPosition} style={{ padding: "14px", background: "#c9a84c", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.1em", marginTop: "4px" }}>
                  + ADD TO PORTFOLIO
                </button>
              </div>
            </div>
            <div style={{ marginTop: "16px", background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>Ticker Format Guide</div>
              {[["US Stocks", "NVDA, AAPL, GOOGL, VOO"], ["Crypto (BTC)", "BTCUSDT"], ["Crypto (XRP)", "XRPUSDT"], ["Crypto (ETH)", "ETHUSDT"], ["Crypto (SOL)", "SOLUSDT"]].map(([label, example]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: "11px", color: "#555" }}>{label}</span>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#c9a84c" }}>{example}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
