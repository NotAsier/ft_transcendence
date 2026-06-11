import { useState } from "react";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

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
  "Yemen","Zambia","Zimbabwe",
];

interface RegisterViewProps {
  onSuccess: (data: {
    email: string; username: string; password: string;
    birthDate?: string; country?: string; gender?: string;
  }) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function RegisterView({ onSuccess, onBack, loading, error }: RegisterViewProps) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [email, setEmail]         = useState("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry]     = useState("");
  const [gender, setGender]       = useState("");

  const handleSubmit = () =>
    onSuccess({
      email, username, password,
      birthDate: birthDate || undefined,
      country:   country   || undefined,
      gender:    gender    || undefined,
    });

  return (
    <div style={s.form}>
      <p style={s.formTitle}>Crear cuenta</p>
      {error && <div style={s.error}>{error}</div>}

      <label style={s.label}>EMAIL *</label>
      <input style={s.input} type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />

      <label style={s.label}>USERNAME *</label>
      <input style={s.input} type="text" value={username}
        onChange={(e) => setUsername(e.target.value)} placeholder="tunombre" />

      <label style={s.label}>CONTRASEÑA *</label>
      <input style={s.input} type="password" value={password}
        onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />

      <label style={s.label}>FECHA DE NACIMIENTO</label>
      <input style={s.input} type="date" value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)} />

      <label style={s.label}>PAÍS</label>
      <select style={s.input} value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">— Selecciona un país —</option>
        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <label style={s.label}>GÉNERO</label>
      <select style={s.input} value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">— Selecciona —</option>
        <option value="male">Hombre</option>
        <option value="female">Mujer</option>
        <option value="nb">No binario</option>
      </select>

      <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSubmit} disabled={loading}>
        {loading ? "Registrando..." : "Crear cuenta"}
      </button>
      <button style={s.btnLink} onClick={onBack}>← Volver</button>
    </div>
  );
}