import type { User } from "../types";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

interface MultiplayerModalProps {
  friends: User[];
  onlineFriends: number[];
  onInvite: (user: User) => void;
  onClose: () => void;
}

export default function MultiplayerModal({
  friends, onlineFriends, onInvite, onClose,
}: MultiplayerModalProps) {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const onlineFriendList = friends.filter((f) => onlineFriends.includes(f.id));

  return (
	<div style={{
	  position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
	  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
	}}>
	  <div style={{
		background: theme.surface, border: `1px solid ${theme.border}`,
		borderRadius: 8, padding: 32, width: 320,
		fontFamily: "'Courier New', monospace",
	  }}>
		<p style={{ ...s.profileLabel, marginBottom: 16, fontSize: 12 }}>
		  AMIGOS CONECTADOS
		</p>

		{onlineFriendList.length === 0 ? (
		  <p style={{ color: theme.textFaint, fontSize: 12 }}>
			Ningún amigo conectado ahora mismo.
		  </p>
		) : (
		  onlineFriendList.map((f) => (
			<div key={f.id} style={{
			  display: "flex", alignItems: "center", justifyContent: "space-between",
			  padding: "8px 0", borderBottom: `1px solid ${theme.border}`,
			}}>
			  <span style={{ color: "#4ecdc4", fontSize: 12, letterSpacing: 1 }}>
				● {f.username}
			  </span>
			  <button
				style={{ ...s.btnSmall, color: theme.text, borderColor: theme.border2 }}
				onClick={() => onInvite(f)}
			  >
				Invitar
			  </button>
			</div>
		  ))
		)}

		<button style={{ ...s.btnLink, marginTop: 16 }} onClick={onClose}>
		  ← Cancelar
		</button>
	  </div>
	</div>
  );
}