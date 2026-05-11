export const s: Record<string, any> = {
  wrapper: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Courier New', monospace",
  },
  card: {
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px",
    padding: "40px 32px", width: "360px", boxShadow: "0 0 60px rgba(0,0,0,0.8)",
    maxHeight: "90vh", overflowY: "auto" as const,
  },
  title: {
    fontSize: "20px", fontWeight: "bold", letterSpacing: "4px", color: "#fff",
    margin: "0 0 4px 0", textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "11px", color: "#555", letterSpacing: "3px", textAlign: "center" as const,
    margin: "0 0 32px 0", textTransform: "uppercase" as const,
  },
  btnGroup: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  btn: {
    width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Courier New', monospace",
    letterSpacing: "3px", border: "none", borderRadius: "2px", cursor: "pointer",
    fontWeight: "bold", marginTop: "8px",
  },
  btnPrimary: { background: "#fff", color: "#000" },
  btnSecondary: { background: "#1e1e1e", color: "#aaa", border: "1px solid #333" },
  btnLink: {
    background: "transparent", border: "none", color: "#555", fontSize: "12px",
    fontFamily: "'Courier New', monospace", cursor: "pointer", letterSpacing: "1px",
    padding: "8px 0", width: "100%",
  },
  btnSmall: {
    background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px",
    color: "#aaa", fontFamily: "'Courier New', monospace", fontSize: "11px",
    cursor: "pointer", padding: "2px 7px", lineHeight: "1.4",
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  formTitle: {
    fontSize: "13px", color: "#aaa", letterSpacing: "2px",
    textTransform: "uppercase" as const, marginBottom: "12px",
  },
  label: { fontSize: "10px", letterSpacing: "2px", color: "#555", marginTop: "8px" },
  input: {
    padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a",
    borderRadius: "2px", color: "#fff", fontFamily: "'Courier New', monospace",
    fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const,
  },
  error: {
    background: "#2a1515", border: "1px solid #ff4444", borderRadius: "2px",
    padding: "8px 12px", fontSize: "12px", color: "#ff6666", marginBottom: "8px", letterSpacing: "1px",
  },
  profileLabel: {
    fontSize: "10px", color: "#444", letterSpacing: "2px",
    margin: "0 0 2px 0", textTransform: "uppercase" as const,
  },
  profileValue: { fontSize: "12px", color: "#aaa", letterSpacing: "1px" },
};
