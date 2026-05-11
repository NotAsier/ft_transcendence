import type { Socket } from "socket.io-client";
import TicTacToe from "./TicTacToe";
import type { Player, User } from "../types";
import { s } from "../styles";

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
  return (
    <div style={{
      flex: "1 1 auto", background: "#1a1a1a", border: "1px solid #2a2a2a",
      borderRadius: 8, padding: 32, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
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
        </>
      )}
    </div>
  );
}