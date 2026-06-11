import type { User, FriendRequest, PendingGame } from "../types";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

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
    const { theme } = useTheme();
    const s = makeStyles(theme);

    return (
        <div style={{
            flex: 1, background: theme.surface, border: `1px solid ${theme.border}`,
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
                                style={{ color: theme.textMuted, fontSize: 12, cursor: "pointer" }}
                                onClick={() => onLoadProfile(r.fromUser.id)}
                            >
                                {r.fromUser.username}
                            </span>
                            <div style={{ display: "flex", gap: 4 }}>
                                <button
                                    style={{ ...s.btnSmall, background: theme.successBg, color: theme.successText, border: `1px solid #2a4a2a` }}
                                    onClick={() => onAcceptRequest(r.fromUser.id)}
                                >✓</button>
                                <button
                                    style={{ ...s.btnSmall, background: theme.rejectBg, color: theme.rejectText, border: `1px solid #4a2a2a` }}
                                    onClick={() => onRemoveFriend(r.fromUser.id)}
                                >✕</button>
                            </div>
                        </div>
                    ))}
                    <div style={{ borderBottom: `1px solid ${theme.border}`, margin: "8px 0" }} />
                </div>
            )}

            {/* Friends list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                {friends.length === 0 ? (
                    <p style={{ color: theme.textFaint, fontSize: 12 }}>Sin amigos aún.</p>
                ) : (
                    friends.map((f) => (
                        <div key={f.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "6px 0", borderBottom: `1px solid ${theme.border}`,
                        }}>
                            <span
                                style={{ color: "#4ecdc4", fontSize: 12, letterSpacing: 1, cursor: "pointer" }}
                                onClick={() => onLoadProfile(f.id)}
                            >
                                {onlineFriends.includes(f.id)
                                    ? <span style={{ color: theme.successText, marginRight: 6 }}>●</span>
                                    : <span style={{ color: theme.textFaint, marginRight: 6 }}>●</span>
                                }
                                ♥ {f.username}
                            </span>
                            <div style={{ display: "flex", gap: 4 }}>
                                {pendingGames[f.id] && (
                                    <button
                                        style={{ ...s.btnSmall, color: theme.successText, border: `1px solid #2a4a2a`, fontWeight: "bold" }}
                                        onClick={() => onReconnectGame(pendingGames[f.id]!)}
                                        title="Reconectar a partida pendiente"
                                    >↻ EN PARTIDA</button>
                                )}
                                <button
                                    style={{ ...s.btnSmall, color: "#4ecdc4", border: "1px solid #2a4a4a" }}
                                    onClick={() => onOpenChat(f)} title="Chat"
                                >✉</button>
                                <button
                                    style={{ ...s.btnSmall, color: theme.textDim, border: `1px solid ${theme.border2}` }}
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