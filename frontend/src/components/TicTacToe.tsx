import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

const API = "/api";

type Difficulty = "easy" | "medium" | "hard";

interface Player   { id: number; username: string; token: string; }
interface Opponent { id: number; username: string; }

interface Props {
    player1:        Player;
    player2:        Opponent;
    onExit:         () => void;
    onGameEnd?:     (gameId: number, opponentId: number) => void;
    isOnline?:      boolean;
    roomId?:        string;
    gameId?:        number;
    myId?:          number;
    gamePlayer1Id?: number;
    socket?:        Socket | null;
    isAIGame?:      boolean;
    aiDifficulty?:  Difficulty | null;
}

export default function TicTacToe({
    player1,
    player2,
    onExit,
    onGameEnd,
    isOnline = false,
    roomId,
    gameId: initialGameId,
    myId,
    gamePlayer1Id,
    socket,
    isAIGame = false,
    aiDifficulty = null,
}: Props) {
    const [gameId,     setGameId]     = useState<number | null>(initialGameId ?? null);
    const [board,      setBoard]      = useState("_________");
    const [status,     setStatus]     = useState(isOnline ? "playing" : "idle");
    const [winner,     setWinner]     = useState<string | null>(null);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState<string | null>(null);
    const [aiThinking, setAiThinking] = useState(false);

    const cells    = (board ?? "_________").split("");
    const xCount   = cells.filter(c => c === "X").length;
    const oCount   = cells.filter(c => c === "O").length;
    const isP1Turn = xCount === oCount;

    const xId = isOnline ? (gamePlayer1Id ?? player1.id) : player1.id;
    const oId = isOnline
        ? (gamePlayer1Id === player1.id ? player2.id : player1.id)
        : player2.id;

    const xName = player1.id === xId ? player1.username : player2.username;
    const oName = player1.id === oId ? player1.username : player2.username;

    const iAmX = isOnline && myId === xId;
    const iAmO = isOnline && myId === oId;

    const isMyTurn = isOnline
        ? (isP1Turn ? iAmX : iAmO)
        : true;

    // ── IA: mueve automáticamente cuando es turno de O ──────────────────────
    useEffect(() => {
        if (!isAIGame || !gameId || status !== "playing" || loading || aiThinking) return;
        if (isP1Turn) return;

        const doAiMove = async () => {
            setAiThinking(true);
            await new Promise(r => setTimeout(r, 500));
            try {
                const res = await fetch(`${API}/game/${gameId}/ai-move`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
                    body: JSON.stringify({ difficulty: aiDifficulty ?? "medium" }),
                });
                const data = await res.json();
                if (data.statusCode) throw new Error(data.message);
                setBoard(data.board);
                setStatus(data.status);
                setWinner(data.winner);
            } catch (e: any) {
                setError(e.message);
            }
            setAiThinking(false);
        };

        doAiMove();
    }, [isAIGame, gameId, status, isP1Turn, loading, aiThinking]);

    // ── Reunirse a la sala al reconectar (FIX: Prevenir que no vea los cambios después de refrescar)
    useEffect(() => {
        if (!isOnline || !socket || !roomId || !initialGameId) return;

        // Emitir evento para unirse a la sala
        socket.emit("join_game_room", { roomId, gameId: initialGameId });

        // Listener para sincronizar estado cuando se reconnecta
        const onGameStateSync = (data: {
            board: string;
            status: string;
            winner: string | null;
            player1Id: number;
            player2Id: number;
        }) => {
            setBoard(data.board);
            setStatus(data.status === "playing" ? "playing" : data.status);
            setWinner(data.winner);
        };

        socket.on("game_state_sync", onGameStateSync);

        return () => {
            socket.off("game_state_sync", onGameStateSync);
            socket.emit("leave_game_room", { roomId });
        };
    }, [isOnline, socket, roomId, initialGameId]);

    // ── Listeners online ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOnline || !socket) return;

        const onGameUpdated = (data: { board: string; status: string; winner: string | null }) => {
            setBoard(data.board); setStatus(data.status); setWinner(data.winner); setError(null);
        };
        const onGameOver = (data: { winner: string | null; board?: string }) => {
            if (data.board) setBoard(data.board);
            let resolvedWinner = data.winner;
            if (data.winner === 'opponent') {
                resolvedWinner = myId === xId ? 'player2' : 'player1';
            }
            setWinner(resolvedWinner);
            setStatus("finished");
            if (onGameEnd && initialGameId) {
                onGameEnd(initialGameId, player2.id);
            }
        };
        const onMoveError = ({ message }: { message: string }) => setError(message);

        socket.on("game_updated", onGameUpdated);
        socket.on("game_over",    onGameOver);
        socket.on("move_error",   onMoveError);

        return () => {
            socket.off("game_updated", onGameUpdated);
            socket.off("game_over",    onGameOver);
            socket.off("move_error",   onMoveError);
        };
    }, [isOnline, socket]);

    // ── Cargar estado del servidor al reconectar ────────────────────────────────
    useEffect(() => {
        if (!isOnline || !initialGameId) return;

        async function fetchGameState() {
            try {
                const res = await fetch(`${API}/game/${initialGameId}`);
                const data = await res.json();
                if (data && !data.statusCode) {
                    setBoard(data.board || "_________");
                    setStatus(data.status === "playing" ? "playing" : data.status);
                    setWinner(data.winner);
                }
            } catch (e) {
                console.error("Error al cargar estado del juego:", e);
            }
        }
        fetchGameState();
    }, [isOnline, initialGameId]);

    // ── Crear partida local ────────────────────────────────────────────────────
    const newGame = async () => {
        if (isOnline) return;
        setLoading(true); setError(null); setAiThinking(false);
        try {
            const r1 = await fetch(`${API}/game`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
                body: JSON.stringify({ player1Id: player1.id }),
            });
            const g1 = await r1.json();
            if (g1.statusCode) throw new Error(g1.message);

            const r2 = await fetch(`${API}/game/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
                body: JSON.stringify({ gameId: g1.id, player2Id: player2.id }),
            });
            const g2 = await r2.json();
            if (g2.statusCode) throw new Error(g2.message);

            setGameId(g2.id); setBoard(g2.board); setStatus("playing"); setWinner(null);
        } catch (e: any) { setError(e.message || "Error al crear la partida"); }
        setLoading(false);
    };

    // ── Mover ────────────────────────────────────────────────────────────────
    const move = async (pos: number) => {
        if (status !== "playing" || cells[pos] !== "_") return;
        if (isAIGame && !isP1Turn) return;
        if (isOnline && (!isMyTurn || !socket || !roomId || !gameId)) return;
        setError(null);

        if (isOnline) {
            socket!.emit("online_move", { gameId, position: pos, roomId });
        } else {
            if (!gameId) return;
            const playerId = isP1Turn ? player1.id : player2.id;
            setLoading(true);
            try {
                const res  = await fetch(`${API}/game/${gameId}/move`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
                    body: JSON.stringify({ playerId, position: pos }),
                });
                const data = await res.json();
                if (data.statusCode) throw new Error(data.message);
                setBoard(data.board); setStatus(data.status); setWinner(data.winner);
            } catch (e: any) { setError(e.message); }
            setLoading(false);
        }
    };

    // ── Labels ───────────────────────────────────────────────────────────────
    const winnerLabel =
        winner === "player1" ? `¡Gana ${xName} (X)!` :
        winner === "player2" ? `¡Gana ${isAIGame ? "la IA" : oName} (O)!` :
        winner === "draw"    ? "¡Empate!" : null;

    const turnLabel = isAIGame
        ? (isP1Turn ? `Tu turno (X)` : "La IA está pensando...")
        : isOnline
            ? (isMyTurn ? "Tu turno" : `Turno de ${isP1Turn ? xName : oName}...`)
            : (isP1Turn
                ? `Turno: ${player1.username} (X)`
                : `Turno: ${player2.username} (O)`);

    const difficultyLabel: Record<Difficulty, string> = {
        easy: "FÁCIL 🟢", medium: "MEDIO 🟡", hard: "DIFÍCIL 🔴",
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "16px", gap: "12px", fontFamily: "monospace", color: "#fff", width: "100%",
        }}>
            <h2 style={{ letterSpacing: "4px", fontSize: "18px", margin: 0 }}>TIC TAC TOE</h2>

            {isAIGame && aiDifficulty && (
                <span style={{
                    fontSize: 10, letterSpacing: 2, color: "#aaa",
                    background: "#111", padding: "2px 10px", borderRadius: 99,
                }}>
                    vs IA · {difficultyLabel[aiDifficulty]}
                </span>
            )}

            {isOnline && (
                <span style={{
                    fontSize: 10, letterSpacing: 2, color: "#4ecdc4",
                    background: "#0a2a2a", padding: "2px 10px", borderRadius: 99,
                }}>
                    ONLINE · Juegas con{" "}
                    <strong style={{ color: iAmX ? "#ff6b35" : "#4ecdc4" }}>
                        {iAmX ? "X" : "O"}
                    </strong>
                </span>
            )}

            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
                <span style={{ color: "#ff6b35" }}>X — {xName}{iAmX ? " (tú)" : ""}</span>
                <span style={{ color: "#555" }}>VS</span>
                <span style={{ color: "#4ecdc4" }}>
                    O — {isAIGame ? "IA" : oName}{iAmO ? " (tú)" : ""}
                </span>
            </div>

            {error && <p style={{ color: "#ff6666", fontSize: "12px", margin: 0 }}>{error}</p>}

            {status === "idle" && (
                <button onClick={newGame} disabled={loading} style={btnStyle}>
                    {loading ? "Creando..." : "Nueva Partida"}
                </button>
            )}

            {status !== "idle" && (
                <>
                    <p style={{ fontSize: "13px", letterSpacing: "1px", color: "#aaa", margin: 0 }}>
                        {winnerLabel ?? turnLabel}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 90px)", gap: "6px" }}>
                        {cells.map((cell, i) => {
                            const canClick =
                                cell === "_" && status === "playing" && !loading && !aiThinking &&
                                (!isOnline || isMyTurn) &&
                                (!isAIGame || isP1Turn);
                            return (
                                <button
                                    key={i}
                                    onClick={() => move(i)}
                                    disabled={!canClick}
                                    style={{
                                        height: "90px", fontSize: "32px", fontWeight: "bold",
                                        background: "#1a1a1a", border: "1px solid #2a2a2a",
                                        borderRadius: "2px", cursor: canClick ? "pointer" : "default",
                                        color: cell === "X" ? "#ff6b35" : cell === "O" ? "#4ecdc4" : "#333",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    {cell === "_" ? "" : cell}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        {!isOnline && (
                            <button onClick={newGame} disabled={loading || aiThinking} style={btnStyle}>
                                {loading ? "..." : "Nueva Partida"}
                            </button>
                        )}
                        <button
                            onClick={onExit}
                            style={{ ...btnStyle, background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}
                        >
                            Volver
                        </button>
                    </div>
                </>
            )}

            {status === "idle" && (
                <button
                    onClick={onExit}
                    style={{ ...btnStyle, background: "transparent", color: "#555", border: "none" }}
                >
                    ← Volver
                </button>
            )}
        </div>
    );
}

const btnStyle: React.CSSProperties = {
    padding: "10px 20px", fontSize: "12px", fontFamily: "monospace",
    letterSpacing: "2px", background: "#fff", color: "#000",
    border: "none", borderRadius: "2px", cursor: "pointer", fontWeight: "bold",
};