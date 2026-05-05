import { useState } from "react";

const API = "/api";

interface Player { id: number; username: string; token: string; }
interface Opponent { id: number; username: string; }

interface Props {
  player1: Player;
  player2: Opponent;
  onExit: () => void;
}

export default function TicTacToe({ player1, player2, onExit }: Props) {
  const [gameId, setGameId] = useState<number | null>(null);
  const [board, setBoard] = useState("_________");
  const [status, setStatus] = useState("idle");
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cells = board.split("");
  const xCount = cells.filter(c => c === "X").length;
  const oCount = cells.filter(c => c === "O").length;
  const isP1Turn = xCount === oCount;

  const newGame = async () => {
    setLoading(true);
    setError(null);
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

      setGameId(g2.id);
      setBoard(g2.board);
      setStatus("playing");
      setWinner(null);
    } catch (e: any) {
      setError(e.message || "Error al crear la partida");
    }
    setLoading(false);
  };

  const move = async (pos: number) => {
    if (status !== "playing" || cells[pos] !== "_" || !gameId) return;
    const playerId = isP1Turn ? player1.id : player2.id;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/game/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
        body: JSON.stringify({ playerId, position: pos }),
      });
      const data = await res.json();
      if (data.statusCode) throw new Error(data.message);
      setBoard(data.board);
      setStatus(data.status);
      setWinner(data.winner);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const winnerLabel =
    winner === "player1" ? `¡Gana ${player1.username} (X)!` :
    winner === "player2" ? `¡Gana ${player2.username} (O)!` :
    winner === "draw"    ? "¡Empate!" : null;

  const turnLabel = isP1Turn
    ? `Turno: ${player1.username} (X)`
    : `Turno: ${player2.username} (O)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", gap: "16px", fontFamily: "monospace", minHeight: "100vh", background: "#0f0f0f", color: "#fff" }}>
      <h2 style={{ letterSpacing: "4px", fontSize: "18px" }}>TIC TAC TOE</h2>

      <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
        <span style={{ color: "#ff6b35" }}>X — {player1.username}</span>
        <span style={{ color: "#555" }}>VS</span>
        <span style={{ color: "#4ecdc4" }}>O — {player2.username}</span>
      </div>

      {error && <p style={{ color: "#ff6666", fontSize: "12px" }}>{error}</p>}

      {status === "idle" && (
        <button onClick={newGame} disabled={loading} style={btnStyle}>
          {loading ? "Creando..." : "Nueva Partida"}
        </button>
      )}

      {status !== "idle" && (
        <>
          <p style={{ fontSize: "13px", letterSpacing: "1px", color: "#aaa" }}>
            {winnerLabel ?? turnLabel}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 90px)", gap: "6px" }}>
            {cells.map((cell, i) => (
              <button
                key={i}
                onClick={() => move(i)}
                disabled={cell !== "_" || status !== "playing" || loading}
                style={{
                  height: "90px",
                  fontSize: "32px",
                  fontWeight: "bold",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "2px",
                  cursor: cell === "_" && status === "playing" ? "pointer" : "default",
                  color: cell === "X" ? "#ff6b35" : cell === "O" ? "#4ecdc4" : "#333",
                  fontFamily: "monospace",
                }}
              >
                {cell === "_" ? "" : cell}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={newGame} disabled={loading} style={btnStyle}>
              {loading ? "..." : "Nueva Partida"}
            </button>
            <button onClick={onExit} style={{ ...btnStyle, background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}>
              Volver
            </button>
          </div>
        </>
      )}

      {status === "idle" && (
        <button onClick={onExit} style={{ ...btnStyle, background: "transparent", color: "#555", border: "none" }}>
          ← Volver
        </button>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "12px",
  fontFamily: "monospace",
  letterSpacing: "2px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "2px",
  cursor: "pointer",
  fontWeight: "bold",
};