
import type { Theme } from "./themes"; 

export const makeStyles = (t: Theme): Record<string, any> => ({
  wrapper: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", background: t.background, fontFamily: "'Courier New', monospace",
  },
  card: {
    background: t.surface, border: `1px solid ${t.border}`, borderRadius: "4px",
    padding: "40px 32px", width: "360px", boxShadow: "0 0 60px rgba(0,0,0,0.8)",
    maxHeight: "90vh", overflowY: "auto" as const,
  },
  title: {
    fontSize: "20px", fontWeight: "bold", letterSpacing: "4px", color: t.text,
    margin: "0 0 4px 0", textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "11px", color: t.textDim, letterSpacing: "3px", textAlign: "center" as const,
    margin: "0 0 32px 0", textTransform: "uppercase" as const,
  },
  btnGroup: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  btn: {
    width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Courier New', monospace",
    letterSpacing: "3px", border: "none", borderRadius: "2px", cursor: "pointer",
    fontWeight: "bold", marginTop: "8px",
  },
  btnPrimary: { background: t.btnPrimaryBg, color: t.btnPrimaryText },
  btnSecondary: { background: t.surface2, color: t.textMuted, border: `1px solid ${t.border2}` },
  btnLink: {
    background: "transparent", border: "none", color: t.textDim, fontSize: "12px",
    fontFamily: "'Courier New', monospace", cursor: "pointer", letterSpacing: "1px",
    padding: "8px 0", width: "100%",
  },
  btnSmall: {
    background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: "2px",
    color: t.textMuted, fontFamily: "'Courier New', monospace", fontSize: "11px",
    cursor: "pointer", padding: "2px 7px", lineHeight: "1.4",
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  formTitle: {
    fontSize: "13px", color: t.textMuted, letterSpacing: "2px",
    textTransform: "uppercase" as const, marginBottom: "12px",
  },
  label: { fontSize: "10px", letterSpacing: "2px", color: t.textDim, marginTop: "8px" },
  input: {
    padding: "9px 12px", background: t.inputBg, border: `1px solid ${t.border}`,
    borderRadius: "2px", color: t.text, fontFamily: "'Courier New', monospace",
    fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const,
  },
  error: {
    background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: "2px",
    padding: "8px 12px", fontSize: "12px", color: t.errorText, marginBottom: "8px", letterSpacing: "1px",
  },
  profileLabel: {
    fontSize: "10px", color: t.textFaint, letterSpacing: "2px",
    margin: "0 0 2px 0", textTransform: "uppercase" as const,
  },
  profileValue: { fontSize: "12px", color: t.textMuted, letterSpacing: "1px" },
});