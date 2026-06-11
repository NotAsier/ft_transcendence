import type { User, FriendRequest, PendingGame } from "../types";
import { s } from "../styles";

interface FriendsPanelProps {
  friends: User[];
  requests: FriendRequest[];
  onlineFriends: number[];
  pendingGames: Record<number, PendingGame | null>;
  onAcceptRequest: (fromUserId: number) => void;
  onRemoveFriend: (userId: number) => void;
  onReconnectGame: (pending: PendingGame) => void;
  onOpenChat: (user: User) => void;
  onLoadProfile: (userId: number) => void;
}

export default function FriendsPanel({
  friends,
  requests,
  onlineFriends,
  pendingGames,
  onAcceptRequest,
  onRemoveFriend,
  onReconnectGame,
  onOpenChat,
  onLoadProfile,
}: FriendsPanelProps) {
  return (
    <div style={{
      flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", minHeight: 0,
    }}>
      <p style={{ ...s.profileLabel, marginBottom: 10 }}>LISTA DE AMIGOS</p>

      {/* Pending requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ ...s.profileLabel, color: "#ff9944", marginBottom: 6 }}>
            PETICIONES ({requests.length})
          </p>
          {requests.map((r) => (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0",
            }}>
              <span
                style={{ color: "#aaa", fontSize: 12, cursor: "pointer" }}
                onClick={() => onLoadProfile(r.fromUser.id)}
              >
                {r.fromUser.username}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  style={{ ...s.btnSmall, background: "#1a3a1a", color: "#4caf50", borderColor: "#2a4a2a" }}
                  onClick={() => onAcceptRequest(r.fromUser.id)}
                >✓</button>
                <button
                  style={{ ...s.btnSmall, background: "#3a1a1a", color: "#ff6666", borderColor: "#4a2a2a" }}
                  onClick={() => onRemoveFriend(r.fromUser.id)}
                >✕</button>
              </div>
            </div>
          ))}
          <div style={{ borderBottom: "1px solid #2a2a2a", margin: "8px 0" }} />
        </div>
      )}

      {/* Friends list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {friends.length === 0 ? (
          <p style={{ color: "#444", fontSize: 12 }}>Sin amigos aún.</p>
        ) : (
          friends.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid #222",
            }}>
              <span
                style={{ color: "#4ecdc4", fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
                onClick={() => onLoadProfile(f.id)}
              >
                {onlineFriends.includes(f.id)
                  ? <span style={{ color: "#4caf50", marginRight: 6 }}>●</span>
                  : <span style={{ color: "#333", marginRight: 6 }}>●</span>
                }
                ♥ {f.username}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {pendingGames[f.id] && (
                  <button
                    style={{ ...s.btnSmall, color: "#4caf50", borderColor: "#2a4a2a", fontWeight: 'bold' }}
                    onClick={() => onReconnectGame(pendingGames[f.id]!)}
                    title="Reconectar a partida pendiente"
                  >↻ EN PARTIDA</button>
                )}
                <button
                  style={{ ...s.btnSmall, color: "#4ecdc4", borderColor: "#2a4a4a" }}
                  onClick={() => onOpenChat(f)} title="Chat"
                >✉</button>
                <button
                  style={{ ...s.btnSmall, color: "#555", borderColor: "#333" }}
                  onClick={() => onRemoveFriend(f.id)} title="Eliminar"
                >✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}