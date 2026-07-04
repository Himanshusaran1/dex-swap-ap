import { useState, useEffect } from "react";

function fmt(n) {
  if (!n || n === 0) return "$0.00";
  if (n >= 1000) return "$" + n.toLocaleString("en", { maximumFractionDigits: 2 });
  if (n >= 1) return "$" + n.toFixed(2);
  return "$" + n.toFixed(6);
}

function TokenModal({ onSelect, onClose, exclude, tokens, loading }) {
  const [search, setSearch] = useState("");
  const filtered = tokens.filter(
    (t) =>
      t.sym !== exclude &&
      (t.sym.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={styles.modalBg} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHead}>
          <span style={styles.modalTitle}>Select a token</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <input
          style={styles.modalSearch}
          placeholder="Search name or symbol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div style={styles.tokenList}>
          {loading ? (
            <div style={styles.loadingTxt}>Loading prices...</div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.sym}
                style={styles.tokenItem}
                onClick={() => onSelect(t)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <img src={t.img} alt={t.sym} style={styles.tokenIconLg} />
                <div>
                  <div style={styles.tiName}>{t.sym}</div>
                  <div style={styles.tiFull}>{t.name}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={styles.tiPrice}>{fmt(t.price)}</div>
                  <div style={{ fontSize: 11, color: t.change >= 0 ? "#27ae60" : "#e74c3c" }}>
                    {t.change >= 0 ? "+" : ""}{t.change?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const COIN_IDS = [
  { id: "ethereum", sym: "ETH", name: "Ethereum", img: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "bitcoin", sym: "BTC", name: "Bitcoin", img: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "binancecoin", sym: "BNB", name: "BNB", img: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: "tether", sym: "USDT", name: "Tether", img: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
  { id: "usd-coin", sym: "USDC", name: "USD Coin", img: "https://assets.coingecko.com/coins/images/6319/small/usdc.png" },
  { id: "solana", sym: "SOL", name: "Solana", img: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "matic-network", sym: "MATIC", name: "Polygon", img: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
  { id: "chainlink", sym: "LINK", name: "Chainlink", img: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  { id: "uniswap", sym: "UNI", name: "Uniswap", img: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png" },
  { id: "dai", sym: "DAI", name: "Dai", img: "https://assets.coingecko.com/coins/images/9956/small/4943.png" },
  { id: "aave", sym: "AAVE", name: "Aave", img: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png" },
  { id: "arbitrum", sym: "ARB", name: "Arbitrum", img: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  { id: "avalanche-2", sym: "AVAX", name: "Avalanche", img: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "shiba-inu", sym: "SHIB", name: "Shiba Inu", img: "https://assets.coingecko.com/coins/images/11939/small/shiba.png" },
  { id: "dogecoin", sym: "DOGE", name: "Dogecoin", img: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
];

export default function Swap() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Swap");
  const [sellToken, setSellToken] = useState(null);
  const [buyToken, setBuyToken] = useState(null);
  const [sellAmount, setSellAmount] = useState("");
  const [modal, setModal] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [swapped, setSwapped] = useState(false);

  async function fetchPrices() {
    setLoading(true);
    try {
      const ids = COIN_IDS.map((c) => c.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await res.json();
      const updated = COIN_IDS.map((c) => ({
        ...c,
        price: data[c.id]?.usd || 0,
        change: data[c.id]?.usd_24h_change || 0,
      }));
      setTokens(updated);
      setSellToken(updated[0]);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Price fetch failed", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const buyAmount =
    sellAmount && buyToken && sellToken
      ? ((parseFloat(sellAmount) * sellToken.price) / buyToken.price).toFixed(6)
      : "";
  const sellUsd = sellAmount && sellToken ? fmt(parseFloat(sellAmount) * sellToken.price) : "$0.00";
  const buyUsd = buyAmount && buyToken ? fmt(parseFloat(buyAmount) * buyToken.price) : "$0.00";
  const rate =
    buyToken && sellToken
      ? `1 ${sellToken.sym} = ${(sellToken.price / buyToken.price).toFixed(4)} ${buyToken.sym}`
      : "";

  function handleSellSelect(t) {
    if (buyToken && buyToken.sym === t.sym) setBuyToken(sellToken);
    setSellToken(t);
    setModal(null);
  }

  function handleBuySelect(t) {
    if (sellToken && sellToken.sym === t.sym) setSellToken(buyToken || tokens[1]);
    setBuyToken(t);
    setModal(null);
  }

  function swapTokens() {
    if (!buyToken) return;
    const tempSell = sellToken;
    const tempBuy = buyToken;
    setSellToken(tempBuy);
    setBuyToken(tempSell);
    setSellAmount(buyAmount || "");
  }

  function handleSwapClick() {
    if (!connected) { setConnected(true); return; }
    if (!buyToken || !sellAmount) return;
    setSwapped(true);
    setTimeout(() => {
      setSwapped(false);
      setSellAmount("");
    }, 3000);
  }

  const tabs = ["Swap", "Limit", "Buy", "Sell"];

  if (loading && tokens.length === 0) {
    return <div style={styles.loadingScreen}>Loading live prices...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.tabRow}>
          <div style={styles.tabs}>
            {tabs.map((t) => (
              <button
                key={t}
                style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button style={styles.settingsBtn} onClick={fetchPrices} title="Refresh prices">🔄</button>
        </div>

        {lastUpdated && (
          <div style={styles.updated}>Live prices · Updated {lastUpdated}</div>
        )}

        {/* Sell Card */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Sell</div>
          <div style={styles.cardRow}>
            <input
              style={styles.amtInput}
              type="number"
              placeholder="0"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
            {sellToken && (
              <button style={styles.tokenBtn} onClick={() => setModal("sell")}>
                <img src={sellToken.img} alt={sellToken.sym} style={styles.tokenIcon} />
                <span style={styles.tokenSym}>{sellToken.sym}</span>
                <span style={{ color: "#888", fontSize: 12 }}>▼</span>
              </button>
            )}
          </div>
          <div style={styles.usdRow}>
            <span style={styles.usdVal}>{sellUsd}</span>
            {sellToken && (
              <span style={{ fontSize: 12, color: sellToken.change >= 0 ? "#27ae60" : "#e74c3c" }}>
                {sellToken.change >= 0 ? "▲" : "▼"} {Math.abs(sellToken.change).toFixed(2)}% 24h
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div style={styles.arrowWrap}>
          <button style={styles.arrowBtn} onClick={swapTokens}>↓</button>
        </div>

        {/* Buy Card */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Buy</div>
          <div style={styles.cardRow}>
            <input
              style={{ ...styles.amtInput, opacity: 0.7 }}
              type="number"
              placeholder="0"
              value={buyAmount}
              readOnly
            />
            {buyToken ? (
              <button style={styles.tokenBtn} onClick={() => setModal("buy")}>
                <img src={buyToken.img} alt={buyToken.sym} style={styles.tokenIcon} />
                <span style={styles.tokenSym}>{buyToken.sym}</span>
                <span style={{ color: "#888", fontSize: 12 }}>▼</span>
              </button>
            ) : (
              <button style={styles.selectBtn} onClick={() => setModal("buy")}>
                Select token ▼
              </button>
            )}
          </div>
          <div style={styles.usdRow}>
            <span style={styles.usdVal}>{buyUsd}</span>
            {buyToken && (
              <span style={{ fontSize: 12, color: buyToken.change >= 0 ? "#27ae60" : "#e74c3c" }}>
                {buyToken.change >= 0 ? "▲" : "▼"} {Math.abs(buyToken.change).toFixed(2)}% 24h
              </span>
            )}
          </div>
        </div>

        {rate && (
          <div style={styles.rateRow}>
            <span style={{ color: "#888" }}>{rate}</span>
            <span style={{ color: "#27ae60" }}>~$2.14 gas</span>
          </div>
        )}

        <button
          style={connected ? styles.swapBtn : styles.connectBtn}
          onClick={handleSwapClick}
        >
          {connected ? (buyToken ? "Swap" : "Select a token") : "Connect wallet"}
        </button>

        {swapped && (
          <div style={styles.successBox}>
            ✅ Swap successful! {sellAmount} {sellToken?.sym} → {buyAmount} {buyToken?.sym}
          </div>
        )}
      </div>

      {modal === "sell" && (
        <TokenModal
          onSelect={handleSellSelect}
          onClose={() => setModal(null)}
          exclude={buyToken?.sym}
          tokens={tokens}
          loading={loading}
        />
      )}
      {modal === "buy" && (
        <TokenModal
          onSelect={handleBuySelect}
          onClose={() => setModal(null)}
          exclude={sellToken?.sym}
          tokens={tokens}
          loading={loading}
        />
      )}
    </div>
  );
}

const styles = {
  page: { display: "flex", justifyContent: "center", padding: "2rem 1rem", minHeight: "100vh", background: "#f7f7f7" },
  loadingScreen: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18, color: "#888" },
  wrap: { width: "100%", maxWidth: 460 },
  tabRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  tabs: { display: "flex", gap: 4 },
  tab: { padding: "8px 16px", borderRadius: 14, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", background: "transparent", color: "#888" },
  tabActive: { background: "#ff007a", color: "#fff" },
  settingsBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4, borderRadius: 8 },
  updated: { fontSize: 11, color: "#aaa", textAlign: "right", marginBottom: 8 },
  card: { background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: "12px 14px", marginBottom: 4 },
  cardLabel: { fontSize: 13, color: "#888", marginBottom: 8 },
  cardRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  amtInput: { fontSize: 32, fontWeight: 500, background: "none", border: "none", outline: "none", color: "#1a1a1a", width: "55%", minWidth: 0 },
  tokenBtn: { display: "flex", alignItems: "center", gap: 6, background: "#f5f5f5", border: "1px solid #eee", borderRadius: 20, padding: "6px 10px 6px 6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  tokenIcon: { width: 24, height: 24, borderRadius: "50%" },
  tokenSym: { fontSize: 15, fontWeight: 600, color: "#1a1a1a" },
  selectBtn: { display: "flex", alignItems: "center", gap: 6, background: "#ff007a", border: "none", borderRadius: 20, padding: "8px 14px", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 500, flexShrink: 0 },
  usdRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  usdVal: { fontSize: 13, color: "#888" },
  arrowWrap: { display: "flex", justifyContent: "center", margin: "-2px 0", zIndex: 2, position: "relative" },
  arrowBtn: { background: "#fff", border: "3px solid #f7f7f7", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#555" },
  rateRow: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 4px 0" },
  connectBtn: { width: "100%", marginTop: 8, padding: 16, borderRadius: 20, border: "none", fontSize: 18, fontWeight: 500, cursor: "pointer", background: "#fdeef6", color: "#ff007a" },
  swapBtn: { width: "100%", marginTop: 8, padding: 16, borderRadius: 20, border: "none", fontSize: 18, fontWeight: 500, cursor: "pointer", background: "#ff007a", color: "#fff" },
  successBox: { marginTop: 12, padding: "14px 18px", background: "#eafaf1", border: "1px solid #27ae60", borderRadius: 16, color: "#27ae60", fontWeight: 600, fontSize: 15, textAlign: "center" },
  modalBg: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 20, border: "1px solid #eee", width: 360, maxHeight: 500, overflow: "hidden", display: "flex", flexDirection: "column" },
  modalHead: { padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" },
  modalTitle: { fontSize: 16, fontWeight: 600 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" },
  modalSearch: { margin: 12, padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", fontSize: 14, outline: "none", width: "calc(100% - 24px)" },
  tokenList: { overflowY: "auto", flex: 1 },
  tokenItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer" },
  tokenIconLg: { width: 32, height: 32, borderRadius: "50%" },
  tiName: { fontSize: 14, fontWeight: 600 },
  tiFull: { fontSize: 12, color: "#888" },
  tiPrice: { fontSize: 13, color: "#555", fontWeight: 500 },
  loadingTxt: { textAlign: "center", padding: 24, color: "#aaa" },
};