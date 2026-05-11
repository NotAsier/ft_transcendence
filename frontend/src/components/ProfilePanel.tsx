import type { Player, UserProfile } from "../types";
import { s } from "../styles";

interface ProfilePanelProps {
  player1: Player;
  selectedProfile: UserProfile | null;
  onClearProfile: () => void;
  onLogout: () => void;
}

export default function ProfilePanel({
  player1,
  selectedProfile,
  onClearProfile,
  onLogout,
}: ProfilePanelProps) {
  const profileData = selectedProfile ?? player1;

  const ownFields: [string, React.ReactNode][] = [
    ["VICTORIAS", <span style={{ color: "#4ecdc4", fontWeight: 700 }}>{player1.wins ?? 0}</span>],
    ["EMAIL",     player1.email || "—"],
    ["PAÍS",      player1.country || "—"],
    ["GÉNERO",    player1.gender || "—"],
    ["CUMPLEAÑOS", player1.birthDate ? new Date(player1.birthDate).toLocaleDateString() : "—"],
  ];

  const otherFields: [string, React.ReactNode][] = selectedProfile
    ? [
        ["VICTORIAS", <span style={{ color: "#4ecdc4", fontWeight: 700 }}>{selectedProfile.wins ?? 0}</span>],
        ["PAÍS",      selectedProfile.country || "—"],
        ["GÉNERO",    selectedProfile.gender || "—"],
        ["CUMPLEAÑOS", selectedProfile.birthDate ? new Date(selectedProfile.birthDate).toLocaleDateString() : "—"],
      ]
    : [];

  const fields = selectedProfile ? otherFields : ownFields;

  return (
    <div style={{
      flex: "0 0 24%", background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: 24, display: "flex", flexDirection: "column",
    }}>
      {/* Avatar + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, background: "#2a2a2a", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "#fff", fontWeight: "bold",
        }}>
          {profileData.username[0].toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: "bold", letterSpacing: 1,
            color: selectedProfile ? "#4ecdc4" : "#fff" }}>
            {profileData.displayName || profileData.username}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: 1 }}>
            @{profileData.username}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map(([label, value]) => (
          <div key={label as string}>
            <p style={s.profileLabel}>{label}</p>
            <p style={{ ...s.profileValue, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Footer action */}
      <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", gap: 4 }}>
        {selectedProfile ? (
          <button style={s.btnLink} onClick={onClearProfile}>← Mi perfil</button>
        ) : (
          <button style={s.btnLink} onClick={onLogout}>← Cerrar sesión</button>
        )}
      </div>
    </div>
  );
}