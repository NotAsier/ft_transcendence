import { s } from "../styles";

interface InvitationToastProps {
  fromUsername: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function InvitationToast({ fromUsername, onAccept, onReject }: InvitationToastProps) {
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, width: 300,
      background: "#1a1a1a", border: "1px solid #4ecdc4",
      borderRadius: 8, padding: 20, zIndex: 2000,
      fontFamily: "'Courier New', monospace",
      boxShadow: "0 0 30px rgba(78,205,196,0.2)",
    }}>
      <p style={{ color: "#4ecdc4", fontSize: 12, letterSpacing: 2, margin: "0 0 8px 0" }}>
        INVITACIÓN RECIBIDA
      </p>
      <p style={{ color: "#aaa", fontSize: 12, margin: "0 0 16px 0" }}>
        <strong style={{ color: "#fff" }}>{fromUsername}</strong> te ha invitado a jugar
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ ...s.btn, ...s.btnPrimary, marginTop: 0, flex: 1, padding: "8px" }}
          onClick={onAccept}
        >
          ACEPTAR
        </button>
        <button
          style={{ ...s.btn, ...s.btnSecondary, marginTop: 0, flex: 1, padding: "8px" }}
          onClick={onReject}
        >
          RECHAZAR
        </button>
      </div>
    </div>
  );
}
