import { useState } from "react";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

interface LoginViewProps {
  onSuccess: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function LoginView({ onSuccess, onBack, loading, error }: LoginViewProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const handleSubmit = () => onSuccess(email, password);

  return (
    <div style={s.form}>
      <p style={s.formTitle}>Iniciar sesión</p>
      {error && <div style={s.error}>{error}</div>}

      <label style={s.label}>EMAIL</label>
      <input style={s.input} type="email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="tu@email.com" />

      <label style={s.label}>CONTRASEÑA</label>
      <input style={s.input} type="password" value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="••••••" />

      <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {/* Separador */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
        <div style={{ flex: 1, height: 1, background: theme.border }} />
        <span style={{ color: theme.textFaint, fontSize: 10, letterSpacing: 2 }}>O</span>
        <div style={{ flex: 1, height: 1, background: theme.border }} />
      </div>

      <button style={{ ...s.btn, ...s.btnSecondary }}
        onClick={() => { window.location.href = "/api/auth/google"; }}>
        CONTINUAR CON GOOGLE
      </button>

      <button style={s.btnLink} onClick={onBack}>← Volver</button>
    </div>
  );
}