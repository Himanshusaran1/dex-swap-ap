import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("Trade");
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = ["Trade", "Explore", "Pool", "Portfolio"];

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🦄</div>
        <span style={styles.logoText}>Uniswap</span>
      </div>

      {/* Desktop Links */}
      <div style={styles.links}>
        {links.map((l) => (
          <button
            key={l}
            style={{ ...styles.link, ...(active === l ? styles.linkActive : {}) }}
            onClick={() => setActive(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Search + Connect */}
      <div style={styles.right}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input style={styles.searchInput} placeholder="Search tokens, pools..." />
          <span style={styles.searchShortcut}>/</span>
        </div>
        <button
          style={connected ? styles.connectedBtn : styles.connectBtn}
          onClick={() => setConnected(!connected)}
        >
          {connected ? "0x1a2...3b4c" : "Connect"}
        </button>
        <button style={styles.moreBtn}>•••</button>

        {/* Mobile hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {links.map((l) => (
            <button
              key={l}
              style={{ ...styles.mobileLink, ...(active === l ? styles.mobileLinkActive : {}) }}
              onClick={() => { setActive(l); setMenuOpen(false); }}
            >
              {l}
            </button>
          ))}
          <button
            style={connected ? styles.connectedBtn : styles.connectBtn}
            onClick={() => setConnected(!connected)}
          >
            {connected ? "0x1a2...3b4c" : "Connect"}
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 50, flexWrap: "wrap", gap: 8 },
  logo: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 18, fontWeight: 700, color: "#ff007a" },
  links: { display: "flex", gap: 4 },
  link: { padding: "8px 16px", borderRadius: 14, fontSize: 15, fontWeight: 500, cursor: "pointer", border: "none", background: "transparent", color: "#555" },
  linkActive: { background: "#f5f5f5", color: "#1a1a1a" },
  right: { display: "flex", alignItems: "center", gap: 8 },
  searchWrap: { display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 12, padding: "8px 12px", gap: 6, border: "1px solid #eee" },
  searchIcon: { fontSize: 14 },
  searchInput: { background: "none", border: "none", outline: "none", fontSize: 14, color: "#555", width: 180 },
  searchShortcut: { fontSize: 11, color: "#aaa", background: "#e0e0e0", borderRadius: 4, padding: "1px 5px" },
  connectBtn: { padding: "8px 18px", borderRadius: 20, border: "none", background: "#ff007a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  connectedBtn: { padding: "8px 18px", borderRadius: 20, border: "1px solid #eee", background: "#f5f5f5", color: "#1a1a1a", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  moreBtn: { padding: "8px 12px", borderRadius: 12, border: "1px solid #eee", background: "none", fontSize: 16, cursor: "pointer", color: "#555" },
  hamburger: { display: "none", background: "none", border: "none", fontSize: 22, cursor: "pointer" },
  mobileMenu: { width: "100%", display: "flex", flexDirection: "column", gap: 8, padding: "12px 0 4px", borderTop: "1px solid #eee" },
  mobileLink: { padding: "10px 16px", borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: "pointer", border: "none", background: "transparent", color: "#555", textAlign: "left" },
  mobileLinkActive: { background: "#f5f5f5", color: "#1a1a1a" },
};