import { useState } from "react";
import type { Socket } from "socket.io-client";
import TicTacToe from "./TicTacToe";
import type { Player, User } from "../types";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

const API = "/api";

type Difficulty = "easy" | "medium" | "hard";

interface LeaderboardEntry {
    id: number;
    username: string;
    displayName?: string;
    wins: number;
    country?: string;
}

interface GameHistoryEntry {
    id: number;
    isVsAI: boolean;
    player1: { id: number; username: string; displayName?: string };
    player2: { id: number; username: string; displayName?: string } | null;
    winner: string | null;
    board: string;
    score1: number;
    score2: number;
    playedAt: string;
    finishedAt: string | null;
    result: "win" | "loss" | "draw";
    opponentName: string;
    playerMark: "X" | "O";
}

interface GameCenterProps {
    player1: Player;
    player2: User | null;
    isOnlineGame: boolean;
    onlineRoomId: string | null;
    onlineGameId: number | null;
    onlinePlayer1Id: number | null;
    invitationSent: number | null;
    socket: Socket | null;
    onStartLocal: () => void;
    onOpenMultiModal: () => void;
    onExitGame: () => void;
    onStartAI: (difficulty: Difficulty) => void;
    isAIGame: boolean;
    aiDifficulty: Difficulty | null;
    onGameEnd: (gameId: number, opponentId: number) => void;
}

export default function GameCenter({
    player1, player2, isOnlineGame, onlineRoomId, onlineGameId, onlinePlayer1Id,
    invitationSent, socket, onStartLocal, onOpenMultiModal, onExitGame,
    onStartAI, isAIGame, aiDifficulty, onGameEnd,
}: GameCenterProps) {
    const { theme } = useTheme();
    const s = makeStyles(theme);

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLB, setLoadingLB] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<GameHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showAISelector, setShowAISelector] = useState(false);

    const openLeaderboard = async () => {
        setShowLeaderboard(true);
        setLoadingLB(true);
        try {
            const res = await fetch(`${API}/user/leaderboard`, {
                headers: { Authorization: `Bearer ${player1.token}` },
            });
            const data = await res.json();
            setLeaderboard(Array.isArray(data) ? data : []);
        } catch {
            setLeaderboard([]);
        }
        setLoadingLB(false);
    };

    const openHistory = async () => {
        setShowHistory(true);
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API}/game/history/me`, {
                headers: { Authorization: `Bearer ${player1.token}` },
            });
            const data = await res.json();
            setHistory(Array.isArray(data) ? data : []);
        } catch {
            setHistory([]);
        }
        setLoadingHistory(false);
    };

    // ── Leaderboard ───────────────────────────────────────────────────────────
    if (showLeaderboard) {
        return (
            <div style={{
                flex: "1 1 auto", background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: 32, display: "flex", flexDirection: "column", gap: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, letterSpacing: 2 }}>LEADERBOARD</p>
                    <button style={{ ...s.btnSmall, color: theme.textDim }} onClick={() => setShowLeaderboard(false)}>
                        ← Volver
                    </button>
                </div>
                {loadingLB ? (
                    <p style={{ color: theme.textFaint, fontSize: 12, textAlign: "center", marginTop: 40 }}>Cargando...</p>
                ) : leaderboard.length === 0 ? (
                    <p style={{ color: theme.textFaint, fontSize: 12, textAlign: "center", marginTop: 40 }}>Sin datos aún.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{
                            display: "grid", gridTemplateColumns: "32px 1fr auto auto",
                            gap: 12, padding: "6px 12px", borderBottom: `1px solid ${theme.border}`,
                        }}>
                            {["#", "JUGADOR", "PAÍS", "WINS"].map((h) => (
                                <span key={h} style={{ fontSize: 10, color: theme.textFaint, letterSpacing: 2 }}>{h}</span>
                            ))}
                        </div>
                        {leaderboard.map((entry, i) => (
                            <div key={entry.id} style={{
                                display: "grid", gridTemplateColumns: "32px 1fr auto auto",
                                gap: 12, padding: "10px 12px",
                                background: entry.id === player1.id ? theme.successBg : i === 0 ? theme.border2 : theme.inputBg,
                                border: `1px solid ${entry.id === player1.id ? "#2a4a2a" : i === 0 ? theme.textMuted : theme.border}`,
                                borderRadius: 4,
                            }}>
                                <span style={{
                                    fontSize: 13, fontWeight: "bold",
                                    color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : theme.textDim,
                                }}>
                                    {i + 1}
                                </span>
                                <span style={{ fontSize: 12, color: entry.id === player1.id ? theme.successText : theme.textMuted, letterSpacing: 1 }}>
                                    {entry.displayName || entry.username}
                                    {entry.id === player1.id && (
                                        <span style={{ color: theme.successText, marginLeft: 6, fontSize: 10 }}>TÚ</span>
                                    )}
                                </span>
                                <span style={{ fontSize: 11, color: theme.textDim }}>{entry.country || "—"}</span>
                                <span style={{ fontSize: 13, color: "#4ecdc4", fontWeight: "bold", textAlign: "right" }}>
                                    {entry.wins}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Historial ─────────────────────────────────────────────────────────────
    if (showHistory) {
        const resultColor = (r: GameHistoryEntry["result"]) =>
            r === "win" ? theme.successText : r === "loss" ? theme.rejectText : theme.textMuted;
        const resultLabel = (r: GameHistoryEntry["result"]) =>
            r === "win" ? "VICTORIA" : r === "loss" ? "DERROTA" : "EMPATE";

        return (
            <div style={{
                flex: "1 1 auto", background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: 32, display: "flex", flexDirection: "column", gap: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, letterSpacing: 2 }}>HISTORIAL</p>
                    <button style={{ ...s.btnSmall, color: theme.textDim }} onClick={() => setShowHistory(false)}>
                        ← Volver
                    </button>
                </div>
                {loadingHistory ? (
                    <p style={{ color: theme.textFaint, fontSize: 12, textAlign: "center", marginTop: 40 }}>Cargando...</p>
                ) : history.length === 0 ? (
                    <p style={{ color: theme.textFaint, fontSize: 12, textAlign: "center", marginTop: 40 }}>Sin partidas aún.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 80px 80px 80px auto",
                            gap: 12, padding: "6px 12px", borderBottom: `1px solid ${theme.border}`,
                        }}>
                            {["RIVAL", "MARCA", "SCORE", "FECHA", "RESULTADO"].map((h) => (
                                <span key={h} style={{ fontSize: 10, color: theme.textFaint, letterSpacing: 2 }}>{h}</span>
                            ))}
                        </div>
                        {history.map((entry) => (
                            <div key={entry.id} style={{
                                display: "grid", gridTemplateColumns: "1fr 80px 80px 80px auto",
                                gap: 12, padding: "10px 12px",
                                background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 4,
                            }}>
                                <span style={{ fontSize: 12, color: theme.textMuted, letterSpacing: 1 }}>
                                    {entry.opponentName}
                                    {entry.isVsAI && <span style={{ color: theme.textDim, marginLeft: 4 }}>(IA)</span>}
                                </span>
                                <span style={{ fontSize: 12, color: theme.textDim, fontWeight: "bold" }}>{entry.playerMark}</span>
                                <span style={{ fontSize: 12, color: theme.textDim, fontFamily: "monospace" }}>
                                    {entry.score1}-{entry.score2}
                                </span>
                                <span style={{ fontSize: 11, color: theme.textDim }}>
                                    {new Date(entry.finishedAt ?? entry.playedAt).toLocaleDateString("es-ES", {
                                        day: "2-digit", month: "2-digit", year: "2-digit",
                                    })}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: "bold", textAlign: "right", color: resultColor(entry.result) }}>
                                    {resultLabel(entry.result)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Selector de dificultad IA ─────────────────────────────────────────────
    if (showAISelector) {
        return (
            <div style={{
                flex: "1 1 auto", background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: 32, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 20,
            }}>
                <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, letterSpacing: 2 }}>JUEGO vs IA</p>
                <p style={{ margin: 0, fontSize: 11, color: theme.textFaint, letterSpacing: 1 }}>Elige la dificultad</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 280 }}>
                    <button
                        style={{ ...s.btn, background: theme.successBg, color: theme.successText, border: `1px solid #2a4a2a`, maxWidth: 280 }}
                        onClick={() => { setShowAISelector(false); onStartAI("easy"); }}
                    >
                        🟢 FÁCIL
                    </button>
                    <button
                        style={{ ...s.btn, background: "#2a2a0a", color: "#ffd700", border: "1px solid #4a4a0a", maxWidth: 280 }}
                        onClick={() => { setShowAISelector(false); onStartAI("medium"); }}
                    >
                        🟡 MEDIO
                    </button>
                    <button
                        style={{ ...s.btn, background: theme.rejectBg, color: theme.rejectText, border: `1px solid #4a1a1a`, maxWidth: 280 }}
                        onClick={() => { setShowAISelector(false); onStartAI("hard"); }}
                    >
                        🔴 DIFÍCIL
                    </button>
                </div>
                <button style={{ ...s.btnSmall, color: theme.textDim, marginTop: 8 }} onClick={() => setShowAISelector(false)}>
                    ← Volver
                </button>
            </div>
        );
    }

    // ── Menú principal / Juego activo ─────────────────────────────────────────
    return (
        <div style={{
            flex: "1 1 auto", background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 8, padding: 32, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16, position: "relative",
        }}>
            {player2 ? (
                <TicTacToe
                    player1={player1} player2={player2} onExit={onExitGame} onGameEnd={onGameEnd}
                    isOnline={isOnlineGame} roomId={onlineRoomId ?? undefined}
                    gameId={onlineGameId ?? undefined} myId={player1.id}
                    gamePlayer1Id={onlinePlayer1Id ?? undefined} socket={socket}
                    isAIGame={isAIGame} aiDifficulty={aiDifficulty}
                />
            ) : (
                <>
                    <p style={{ color: theme.textMuted, fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
                        MODO DE JUEGO
                    </p>
                    <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }} onClick={onStartLocal}>
                        JUEGO LOCAL
                    </button>
                    <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }} onClick={() => setShowAISelector(true)}>
                        JUEGO vs IA
                    </button>
                    <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }} onClick={onOpenMultiModal}>
                        MULTIJUGADOR
                    </button>
                    {invitationSent && (
                        <p style={{ color: theme.textDim, fontSize: 11, letterSpacing: 1 }}>
                            Esperando respuesta...
                        </p>
                    )}
                    <p style={{ color: theme.textFaint, fontSize: 11, marginTop: 8 }}>
                        Elige un amigo de la lista para jugar
                    </p>
                    <div style={{ position: "absolute", bottom: 24, left: 24, display: "flex", gap: 8 }}>
                        <button
                            style={{ ...s.btnSmall, fontSize: 11, letterSpacing: 1, padding: "6px 12px" }}
                            onClick={openLeaderboard}
                        >
                            🏆 LEADERBOARD
                        </button>
                        <button
                            style={{ ...s.btnSmall, fontSize: 11, letterSpacing: 1, padding: "6px 12px" }}
                            onClick={openHistory}
                        >
                            📋 HISTORIAL
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}