import { useState } from "react";
import type { Socket } from "socket.io-client";
import TicTacToe from "./TicTacToe";
import type { Player, User } from "../types";
import { s } from "../styles";

const API = "/api";

interface LeaderboardEntry {
  id: number;
  username: string;
  displayName?: string;
  wins: number;
  country?: string;
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
}

export default function GameCenter({
  player1,
  player2,
  isOnlineGame,
  onlineRoomId,
  onlineGameId,
  onlinePlayer1Id,
  invitationSent,
  socket,
  onStartLocal,
  onOpenMultiModal,
  onExitGame,
}: GameCenterProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLB, setLoadingLB] = useState(false);

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

  if (showLeaderboard) {
    return (
      <div style={{
        flex: "1 1 auto", background: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 8, padding: 32, display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#aaa", letterSpacing: 2 }}>LEADERBOARD</p>
          <button style={{ ...s.btnSmall, color: "#555" }} onClick={() => setShowLeaderboard(false)}>
            ← Volver
          </button>
        </div>

        {loadingLB ? (
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 40 }}>Cargando...</p>
        ) : leaderboard.length === 0 ? (
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 40 }}>Sin datos aún.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Cabecera */}
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto",
              gap: 12, padding: "6px 12px", borderBottom: "1px solid #2a2a2a" }}>
              <span style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>#</span>
              <span style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>JUGADOR</span>
              <span style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>PAÍS</span>
              <span style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>WINS</span>
            </div>

            {leaderboard.map((entry, i) => (
              <div key={entry.id} style={{
                display: "grid", gridTemplateColumns: "32px 1fr auto auto",
                gap: 12, padding: "10px 12px",
                background: entry.id === player1.id ? "#1a2a1a" : i === 0 ? "#1a1a0a" : "#111",
                border: `1px solid ${entry.id === player1.id ? "#2a4a2a" : i === 0 ? "#3a3a0a" : "#222"}`,
                borderRadius: 4,
              }}>
                <span style={{
                  fontSize: 13, fontWeight: "bold",
                  color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#555",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 12, color: entry.id === player1.id ? "#4caf50" : "#aaa", letterSpacing: 1 }}>
                  {entry.displayName || entry.username}
                  {entry.id === player1.id && <span style={{ color: "#4caf50", marginLeft: 6, fontSize: 10 }}>TÚ</span>}
                </span>
                <span style={{ fontSize: 11, color: "#555" }}>{entry.country || "—"}</span>
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

  return (
    <div style={{
      flex: "1 1 auto", background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: 32, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16, position: "relative",
    }}>
      {player2 ? (
        <TicTacToe
          player1={player1}
          player2={player2}
          onExit={onExitGame}
          isOnline={isOnlineGame}
          roomId={onlineRoomId ?? undefined}
          gameId={onlineGameId ?? undefined}
          myId={player1.id}
          gamePlayer1Id={onlinePlayer1Id ?? undefined}
          socket={socket}
        />
      ) : (
        <>
          <p style={{ color: "#aaa", fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
            MODO DE JUEGO
          </p>
          <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }} onClick={onStartLocal}>
            JUEGO LOCAL
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }}>
            JUEGO vs IA
          </button>
          <button
            style={{ ...s.btn, ...s.btnSecondary, maxWidth: 280 }}
            onClick={onOpenMultiModal}
          >
            MULTIJUGADOR
          </button>
          {invitationSent && (
            <p style={{ color: "#555", fontSize: 11, letterSpacing: 1 }}>
              Esperando respuesta...
            </p>
          )}
          <p style={{ color: "#333", fontSize: 11, marginTop: 8 }}>
            Elige un amigo de la lista para jugar
          </p>

          {/* Botones inferiores */}
          <div style={{
            position: "absolute", bottom: 24, left: 24,
            display: "flex", gap: 8,
          }}>
            <button
              style={{ ...s.btnSmall, fontSize: 11, letterSpacing: 1, padding: "6px 12px" }}
              onClick={openLeaderboard}
            >
              🏆 LEADERBOARD
            </button>
            <button
              style={{ ...s.btnSmall, fontSize: 11, letterSpacing: 1, padding: "6px 12px" }}
            >
              📋 HISTORIAL
            </button>
          </div>
        </>
      )}
    </div>
  );
}
