import type { User, FriendStatus, PendingGame } from "../types";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

interface PlayerListProps {
  users: User[];
  friendStatus: Record<number, FriendStatus>;
  pendingGames: Record<number, PendingGame | null>;
  onSendRequest: (userId: number) => void;
  onAcceptRequest: (userId: number) => void;
  onRemoveFriend: (userId: number) => void;
  onReconnectGame: (pending: PendingGame) => void;
  onLoadProfile: (userId: number) => void;
}

export default function PlayerList({
  users, friendStatus, pendingGames,
  onSendRequest, onAcceptRequest, onRemoveFriend, onReconnectGame, onLoadProfile,
}: PlayerListProps) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  return (
    <div style={{
      flex: 1, background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", minHeight: 0,
    }}>
      <p style={{ ...s.profileLabel, marginBottom: 10 }}>LISTA DE JUGADORES</p>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {users.length === 0 ? (
          <p style={{ color: theme.textFaint, fontSize: 12 }}>Sin jugadores online.</p>
        ) : (
          users.map((u) => {
            const status = friendStatus[u.id] ?? "none";
            return (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 0", borderBottom: `1px solid ${theme.border}`,
              }}>
                <span
                  style={{ color: theme.textMuted, fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
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
                    <span style={{ fontSize: 10, color: theme.textDim, letterSpacing: 1 }}>ENVIADO</span>
                  )}
                  
                  {status === "friends" && pendingGames[u.id] && (
                    <button
                      
                      onClick={() => onReconnectGame(pendingGames[u.id]!)}
                      title="Reconectar a partida pendiente"
                    >↻ EN PARTIDA</button>
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