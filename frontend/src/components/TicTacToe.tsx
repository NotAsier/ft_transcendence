import { useState } from "react";
 
const API = "/api";
const TOKEN1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTc3NjE1NDM0NCwiZXhwIjoxNzc2NzU5MTQ0fQ.a6mIUSV4wH9rVoK4V87nq3oM6t3bP5qpnrEZ-KfcOds";
const TOKEN2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoidGVzdDJAdGVzdC5jb20iLCJpYXQiOjE3NzYxNTQzODEsImV4cCI6MTc3Njc1OTE4MX0.JEwUtC4Jb9xgJB_sJfiGfTADRkGKWDPbzbUb3n9GZ0A";
 
export default function TicTacToe() {
  const [gameId, setGameId] = useState<number | null>(null);
  const [board, setBoard] = useState("_________");
  const [status, setStatus] = useState("idle"); // idle | playing | finished
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN1}` },
        body: JSON.stringify({ player1Id: 1 }),
      });
      const g1 = await r1.json();
 
      const r2 = await fetch(`${API}/game/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN2}` },
        body: JSON.stringify({ gameId: g1.id, player2Id: 2 }),
      });
      const g2 = await r2.json();
 
      setGameId(g2.id);
      setBoard(g2.board);
      setStatus("playing");
      setWinner(null);
    } catch {
      setError("Error al crear la partida");
    }
    setLoading(false);
  };
 
  const move = async (pos: number) => {
    if (status !== "playing" || cells[pos] !== "_" || !gameId) return;
    const playerId = isP1Turn ? 1 : 2;
    const token = isP1Turn ? TOKEN1 : TOKEN2;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/game/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
 
  const turnLabel = isP1Turn ? "Turno: X (J1)" : "Turno: O (J2)";
  const winnerLabel =
    winner === "player1" ? "¡Gana J1 (X)!" :
    winner === "player2" ? "¡Gana J2 (O)!" :
    winner === "draw"    ? "¡Empate!" : null;
 
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", gap: "16px", fontFamily: "monospace" }}>
      <h2>Tic Tac Toe</h2>
 
      {error && <p style={{ color: "red" }}>{error}</p>}
 
      {status === "idle" && (
        <button onClick={newGame} disabled={loading}>
          {loading ? "Creando..." : "Nueva Partida"}
        </button>
      )}
 
      {status !== "idle" && (
        <>
          <p>{winnerLabel ?? turnLabel}</p>
 
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: "4px" }}>
            {cells.map((cell, i) => (
              <button
                key={i}
                onClick={() => move(i)}
                disabled={cell !== "_" || status !== "playing" || loading}
                style={{
                  height: "80px",
                  fontSize: "28px",
                  cursor: cell === "_" && status === "playing" ? "pointer" : "default",
                  color: cell === "X" ? "#e63946" : "#457b9d",
                }}
              >
                {cell === "_" ? "" : cell}
              </button>
            ))}
          </div>
 
          <button onClick={newGame} disabled={loading}>
            {loading ? "..." : "Nueva Partida"}
          </button>
        </>
      )}
    </div>
  );
}