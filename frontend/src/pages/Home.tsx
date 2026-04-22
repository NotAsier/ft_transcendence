import { useState } from "react";
import TicTacToe from "../components/TicTacToe";

const API = "/api";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China",
  "Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Finland",
  "France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Latvia","Lebanon",
  "Libya","Lithuania","Luxembourg","Malaysia","Mali","Malta","Mexico","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Nepal",
  "Netherlands","New Zealand","Nicaragua","Nigeria","North Korea","Norway","Oman",
  "Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka",
  "Sudan","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe"
];

type View = "home" | "login" | "register" | "lobby" | "game";

interface User { id: number; username: string; }
interface Player {
  id: number;
  username: string;
  token: string;
  email?: string;
  displayName?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  wins?: number;
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBirthDate, setRegBirthDate] = useState("");
  const [regCountry, setRegCountry] = useState("");
  const [regGender, setRegGender] = useState("");

  const fetchUsers = async (token: string) => {
    const res = await fetch(`${API}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.statusCode) throw new Error(data.message);

      const meRes = await fetch(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const me = await meRes.json();

      const p1: Player = {
        id: me.id,
        username: me.username,
        token: data.access_token,
        email: me.email,
        displayName: me.displayName,
        country: me.country,
        gender: me.gender,
        birthDate: me.birthDate,
        wins: me.wins,
      };
      setPlayer1(p1);

      const all = await fetchUsers(data.access_token);
      setUsers(all.filter((u: User) => u.id !== me.id));
      setView("lobby");
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          username: regUsername,
          password: regPassword,
          birthDate: regBirthDate || undefined,
          country: regCountry || undefined,
          gender: regGender || undefined,
        }),
      });
      const data = await res.json();
      if (data.statusCode) throw new Error(data.message);

      const meRes = await fetch(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const me = await meRes.json();

      const p1: Player = {
        id: me.id,
        username: me.username,
        token: data.access_token,
        email: me.email,
        displayName: me.displayName,
        country: me.country,
        gender: me.gender,
        birthDate: me.birthDate,
        wins: me.wins,
      };
      setPlayer1(p1);

      const all = await fetchUsers(data.access_token);
      setUsers(all.filter((u: User) => u.id !== me.id));
      setView("lobby");
    } catch (e: any) {
      setError(e.message || "Error al registrarse");
    }
    setLoading(false);
  };

  const startGame = (opponent: User) => {
    setPlayer2(opponent);
    setView("game");
  };

  if (view === "game" && player1 && player2) {
    return (
      <TicTacToe
        player1={player1}
        player2={player2}
        onExit={() => { setView("lobby"); setPlayer2(null); }}
      />
    );
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.title}>FT TRANSCENDENCE</h1>
        <p style={s.subtitle}>Tic Tac Toe</p>

        {/* HOME */}
        {view === "home" && (
          <div style={s.btnGroup}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setView("login"); setError(null); }}>
              Sign In
            </button>
            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => { setView("register"); setError(null); }}>
              Sign Up
            </button>
          </div>
        )}

        {/* LOGIN */}
        {view === "login" && (
          <div style={s.form}>
            <p style={s.formTitle}>Iniciar sesión</p>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>EMAIL</label>
            <input style={s.input} type="email" value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="tu@email.com" />
            <label style={s.label}>CONTRASEÑA</label>
            <input style={s.input} type="password" value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••" />
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleLogin} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button style={s.btnLink} onClick={() => { setView("home"); setError(null); }}>← Volver</button>
          </div>
        )}

        {/* REGISTER */}
        {view === "register" && (
          <div style={s.form}>
            <p style={s.formTitle}>Crear cuenta</p>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>EMAIL *</label>
            <input style={s.input} type="email" value={regEmail}
              onChange={e => setRegEmail(e.target.value)} placeholder="tu@email.com" />
            <label style={s.label}>USERNAME *</label>
            <input style={s.input} type="text" value={regUsername}
              onChange={e => setRegUsername(e.target.value)} placeholder="tunombre" />
            <label style={s.label}>CONTRASEÑA *</label>
            <input style={s.input} type="password" value={regPassword}
              onChange={e => setRegPassword(e.target.value)} placeholder="••••••" />
            <label style={s.label}>FECHA DE NACIMIENTO</label>
            <input style={s.input} type="date" value={regBirthDate}
              onChange={e => setRegBirthDate(e.target.value)} />
            <label style={s.label}>PAÍS</label>
            <select style={s.input} value={regCountry} onChange={e => setRegCountry(e.target.value)}>
              <option value="">— Selecciona un país —</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={s.label}>GÉNERO</label>
            <select style={s.input} value={regGender} onChange={e => setRegGender(e.target.value)}>
              <option value="">— Selecciona —</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="nb">No binario</option>
            </select>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleRegister} disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
            <button style={s.btnLink} onClick={() => { setView("home"); setError(null); }}>← Volver</button>
          </div>
        )}

        {/* LOBBY */}
        {view === "lobby" && player1 && (
          <div>
            {/* Perfil */}
            <div style={s.profile}>
              <div style={s.profileHeader}>
                <div style={s.avatar}>{player1.username[0].toUpperCase()}</div>
                <div>
                  <p style={s.profileName}>{player1.displayName || player1.username}</p>
                  <p style={s.profileSub}>@{player1.username}</p>
                </div>
              </div>
              <div style={s.profileGrid}>
                <div style={s.profileField}>
                  <span style={s.profileLabel}>EMAIL</span>
                  <span style={s.profileValue}>{player1.email || "—"}</span>
                </div>
                <div style={s.profileField}>
                  <span style={s.profileLabel}>VICTORIAS</span>
                  <span style={{ ...s.profileValue, color: "#4ecdc4" }}>{player1.wins ?? 0}</span>
                </div>
                <div style={s.profileField}>
                  <span style={s.profileLabel}>PAÍS</span>
                  <span style={s.profileValue}>{player1.country || "—"}</span>
                </div>
                <div style={s.profileField}>
                  <span style={s.profileLabel}>GÉNERO</span>
                  <span style={s.profileValue}>{player1.gender || "—"}</span>
                </div>
                <div style={s.profileField}>
                  <span style={s.profileLabel}>NACIMIENTO</span>
                  <span style={s.profileValue}>
                    {player1.birthDate ? new Date(player1.birthDate).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de oponentes */}
            <p style={s.formTitle}>Elige oponente (J2)</p>
            {users.length === 0 && (
              <p style={{ color: "#555", fontSize: "12px" }}>No hay otros jugadores registrados.</p>
            )}
            <div style={s.userList}>
              {users.map(u => (
                <button key={u.id} style={s.userItem} onClick={() => startGame(u)}>
                  <span style={{ color: "#4ecdc4" }}>O</span> {u.username}
                </button>
              ))}
            </div>
            <button style={s.btnLink} onClick={() => { setView("home"); setPlayer1(null); setUsers([]); }}>
              ← Cerrar sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const s: Record<string, any> = {
  wrapper: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Courier New', monospace",
  },
  card: {
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "4px",
    padding: "40px 32px", width: "360px", boxShadow: "0 0 60px rgba(0,0,0,0.8)",
    maxHeight: "90vh", overflowY: "auto" as const,
  },
  title: { fontSize: "20px", fontWeight: "bold", letterSpacing: "4px", color: "#fff", margin: "0 0 4px 0", textAlign: "center" as const },
  subtitle: { fontSize: "11px", color: "#555", letterSpacing: "3px", textAlign: "center" as const, margin: "0 0 32px 0", textTransform: "uppercase" as const },
  btnGroup: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  btn: { width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Courier New', monospace", letterSpacing: "3px", border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold", marginTop: "8px" },
  btnPrimary: { background: "#fff", color: "#000" },
  btnSecondary: { background: "#1e1e1e", color: "#aaa", border: "1px solid #333" },
  btnLink: { background: "transparent", border: "none", color: "#555", fontSize: "12px", fontFamily: "'Courier New', monospace", cursor: "pointer", letterSpacing: "1px", marginTop: "8px", padding: "8px 0", width: "100%" },
  form: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  formTitle: { fontSize: "13px", color: "#aaa", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "12px" },
  label: { fontSize: "10px", letterSpacing: "2px", color: "#555", marginTop: "8px" },
  input: { padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px", color: "#fff", fontFamily: "'Courier New', monospace", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const },
  error: { background: "#2a1515", border: "1px solid #ff4444", borderRadius: "2px", padding: "8px 12px", fontSize: "12px", color: "#ff6666", marginBottom: "8px", letterSpacing: "1px" },
  loggedIn: { background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: "2px", padding: "10px 14px", fontSize: "13px", color: "#4caf50", marginBottom: "16px", letterSpacing: "1px" },
  userList: { display: "flex", flexDirection: "column" as const, gap: "6px", marginBottom: "12px" },
  userItem: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "10px 14px", color: "#aaa", fontFamily: "'Courier New', monospace", fontSize: "13px", cursor: "pointer", textAlign: "left" as const, letterSpacing: "1px" },
  profile: {
    background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px",
    padding: "16px", marginBottom: "20px",
  },
  profileHeader: {
    display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px",
  },
  avatar: {
    width: "40px", height: "40px", background: "#2a2a2a", borderRadius: "2px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", color: "#fff", fontWeight: "bold", flexShrink: 0,
  },
  profileName: { margin: 0, fontSize: "14px", color: "#fff", fontWeight: "bold" },
  profileSub: { margin: 0, fontSize: "11px", color: "#555", letterSpacing: "1px" },
  profileGrid: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  profileField: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  profileLabel: { fontSize: "10px", color: "#444", letterSpacing: "2px" },
  profileValue: { fontSize: "12px", color: "#aaa", letterSpacing: "1px" },
};
