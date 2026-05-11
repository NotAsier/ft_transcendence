import type { User, FriendStatus } from "../types";
import { s } from "../styles";

interface PlayerListProps {
  users: User[];
  friendStatus: Record<number, FriendStatus>;
  onSendRequest: (userId: number) => void;
  onAcceptRequest: (userId: number) => void;
  onRemoveFriend: (userId: number) => void;
  onStartGame: (user: User) => void;
  onLoadProfile: (userId: number) => void;
}

export default function PlayerList({
  users,
  friendStatus,
  onSendRequest,
  onAcceptRequest,
  onRemoveFriend,
  onStartGame,
  onLoadProfile,
}: PlayerListProps) {
  return (
    <div style={{
      flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", minHeight: 0,
    }}>
      <p style={{ ...s.profileLabel, marginBottom: 10 }}>LISTA DE JUGADORES</p>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {users.length === 0 ? (
          <p style={{ color: "#444", fontSize: 12 }}>Sin jugadores online.</p>
        ) : (
          users.map((u) => {
            const status = friendStatus[u.id] ?? "none";
            return (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 0", borderBottom: "1px solid #222",
              }}>
                <span
                  style={{ color: "#aaa", fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
                  onClick={() => onLoadProfile(u.id)}
                >
                  {status === "friends" && (
                    <span style={{ color: "#4ecdc4", marginRight: 6 }}>♥</span>
                  )}
                  {u.username}
                </span>

                <div style={{ display: "flex", gap: 4 }}>
                  {status === "none" && (
                    <button style={s.btnSmall} onClick={() => onSendRequest(u.id)} title="Enviar petición">
                      +
                    </button>
                  )}
                  {status === "pending_sent" && (
                    <span style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>ENVIADO</span>
                  )}
                  {status === "pending_received" && (
                    <>
                      <button
                        style={{ ...s.btnSmall, background: "#1a3a1a", color: "#4caf50", borderColor: "#2a4a2a" }}
                        onClick={() => onAcceptRequest(u.id)} title="Aceptar"
                      >✓</button>
                      <button
                        style={{ ...s.btnSmall, background: "#3a1a1a", color: "#ff6666", borderColor: "#4a2a2a" }}
                        onClick={() => onRemoveFriend(u.id)} title="Rechazar"
                      >✕</button>
                    </>
                  )}
                  {status === "friends" && (
                    <button
                      style={{ ...s.btnSmall, color: "#555", borderColor: "#333" }}
                      onClick={() => onStartGame(u)} title="Jugar"
                    >▶</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}