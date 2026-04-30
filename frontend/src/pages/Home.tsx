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

  // ── GAME ──────────────────────────────────────────────────────────────────
  if (view === "game" && player1 && player2) {
    return (
      <TicTacToe
        player1={player1}
        player2={player2}
        onExit={() => { setView("lobby"); setPlayer2(null); }}
      />
    );
  }

  // ── LOBBY (pantalla completa, proporciones imagen) ────────────────────────
  // Layout: col izq (perfil, ~25%) | col centro (acciones, ~45%) | col der (listas, ~25%)
  // + barra inferior con título
  if (view === "lobby" && player1) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        width: "100vw", height: "100vh",
        background: "#0f0f0f", fontFamily: "'Courier New', monospace",
        boxSizing: "border-box", padding: 20, gap: 16,
      }}>

        {/* Fila principal: 3 columnas */}
        <div style={{ display: "flex", flex: 1, gap: 16, minHeight: 0 }}>

          {/* Columna izquierda: Perfil (~25%) */}
          <div style={{
            flex: "0 0 24%", background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 8, padding: 24, display: "flex", flexDirection: "column", gap: 0,
          }}>
            {/* Avatar + nombre */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, background: "#2a2a2a", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: "#fff", fontWeight: "bold", flexShrink: 0,
              }}>
                {player1.username[0].toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, color: "#fff", fontWeight: "bold", letterSpacing: 1 }}>
                  {player1.displayName || player1.username}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: 1 }}>
                  @{player1.username}
                </p>
              </div>
            </div>

            {/* Datos de perfil */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={s.profileLabel}>VICTORIAS</p>
                <p style={{ ...s.profileValue, color: "#4ecdc4", fontWeight: 700, fontSize: 18, margin: 0 }}>
                  {player1.wins ?? 0}
                </p>
              </div>
              <div>
                <p style={s.profileLabel}>EMAIL</p>
                <p style={{ ...s.profileValue, margin: 0 }}>{player1.email || "—"}</p>
              </div>
              <div>
                <p style={s.profileLabel}>PAÍS</p>
                <p style={{ ...s.profileValue, margin: 0 }}>{player1.country || "—"}</p>
              </div>
              <div>
                <p style={s.profileLabel}>GÉNERO</p>
                <p style={{ ...s.profileValue, margin: 0 }}>{player1.gender || "—"}</p>
              </div>
              <div>
                <p style={s.profileLabel}>CUMPLEAÑOS</p>
                <p style={{ ...s.profileValue, margin: 0 }}>
                  {player1.birthDate ? new Date(player1.birthDate).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>

            {/* Cerrar sesión al fondo */}
            <div style={{ marginTop: "auto", paddingTop: 24 }}>
              <button
                style={s.btnLink}
                onClick={() => { setView("home"); setPlayer1(null); setUsers([]); }}
              >
                ← Cerrar sesión
              </button>
            </div>
          </div>

          {/* Columna centro: Acciones (~45%) */}
          <div style={{
            flex: "1 1 auto", background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderRadius: 8, padding: 32, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }}>
              JUEGO LOCAL
            </button>
            <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }}>
              JUEGO vs IA
            </button>
            <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }}>
              MULTIJUGADOR
            </button>
          </div>

          {/* Columna derecha: Listas (~25%) */}
          <div style={{
            flex: "0 0 24%", display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* Lista de jugadores (mitad superior) */}
            <div style={{
              flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", minHeight: 0,
            }}>
              <p style={{ ...s.profileLabel, marginBottom: 10 }}>LISTA DE JUGADORES</p>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {users.length === 0 ? (
                  <p style={{ color: "#444", fontSize: 12 }}>Sin jugadores online.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {users.map(u => (
                      <button key={u.id} style={{ ...s.userItem }} onClick={() => startGame(u)}>
                        <span style={{ color: "#4ecdc4", marginRight: 8 }}>•</span>{u.username}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lista de amigos (mitad inferior) */}
            <div style={{
              flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", minHeight: 0,
            }}>
              <p style={{ ...s.profileLabel, marginBottom: 10 }}>LISTA DE AMIGOS</p>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <p style={{ color: "#444", fontSize: 12 }}>Sin amigos aún.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Barra inferior: Título */}
        <div style={{
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8,
          padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold", letterSpacing: 6, color: "#fff" }}>
            FT TRANSCENDENCE
          </h1>
        </div>

      </div>
    );
  }

  // ── HOME / LOGIN / REGISTER (card centrada) ───────────────────────────────
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
  btnLink: { background: "transparent", border: "none", color: "#555", fontSize: "12px", fontFamily: "'Courier New', monospace", cursor: "pointer", letterSpacing: "1px", padding: "8px 0", width: "100%" },
  form: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  formTitle: { fontSize: "13px", color: "#aaa", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "12px" },
  label: { fontSize: "10px", letterSpacing: "2px", color: "#555", marginTop: "8px" },
  input: { padding: "9px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px", color: "#fff", fontFamily: "'Courier New', monospace", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" as const },
  error: { background: "#2a1515", border: "1px solid #ff4444", borderRadius: "2px", padding: "8px 12px", fontSize: "12px", color: "#ff6666", marginBottom: "8px", letterSpacing: "1px" },
  userItem: { background: "#111", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "8px 12px", color: "#aaa", fontFamily: "'Courier New', monospace", fontSize: "12px", cursor: "pointer", textAlign: "left" as const, letterSpacing: "1px", width: "100%" },
  profileLabel: { fontSize: "10px", color: "#444", letterSpacing: "2px", margin: "0 0 2px 0", textTransform: "uppercase" as const },
  profileValue: { fontSize: "12px", color: "#aaa", letterSpacing: "1px" },
};