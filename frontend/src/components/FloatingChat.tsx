import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { User, Player } from "../types";
import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";

type ChatMessage = { fromUserId: number; content: string; sentAt: string };

interface FloatingChatProps {
    chatWith: User;
    player1: Player;
    messages: ChatMessage[];
    input: string;
    socket: Socket | null;
    onInputChange: (val: string) => void;
    onSend: () => void;
    onClose: () => void;
}

export default function FloatingChat({
    chatWith,
    player1,
    messages,
    input,
    socket,
    onInputChange,
    onSend,
    onClose,
}: FloatingChatProps) {
    const { theme } = useTheme();
    const s = makeStyles(theme);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        socket.emit("getDirectHistory", { userId1: player1.id, userId2: chatWith.id });
    }, [chatWith.id, player1.id, socket]);

    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, width: 300,
            background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8,
            boxShadow: "0 0 30px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column",
            fontFamily: "'Courier New', monospace", zIndex: 1000,
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderBottom: `1px solid ${theme.border}`,
            }}>
                <span style={{ color: "#4ecdc4", fontSize: 12, letterSpacing: 2 }}>
                    ♥ {chatWith.username.toUpperCase()}
                </span>
                <button
                    style={{ ...s.btnSmall, color: theme.textDim, borderColor: theme.border2, fontSize: 13 }}
                    onClick={onClose}
                >✕</button>
            </div>

            {/* Messages */}
            <div style={{
                height: 200, overflowY: "auto", padding: "10px 14px",
                display: "flex", flexDirection: "column", gap: 6,
            }}>
                {messages.length === 0 ? (
                    <p style={{ color: theme.textFaint, fontSize: 11, textAlign: "center", marginTop: 80 }}>
                        Sin mensajes aún
                    </p>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} style={{
                            display: "flex",
                            justifyContent: m.fromUserId === player1.id ? "flex-end" : "flex-start",
                        }}>
                            <span style={{
                                background: m.fromUserId === player1.id ? "#2a2a4a" : theme.surface2,
                                color: m.fromUserId === player1.id ? "#aaaaff" : theme.textMuted,
                                borderRadius: 4, padding: "4px 8px", fontSize: 12, maxWidth: "75%",
                                wordBreak: "break-word",
                            }}>
                                {m.content}
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", borderTop: `1px solid ${theme.border}` }}>
                <input
                    style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        color: theme.text, fontFamily: "'Courier New', monospace", fontSize: 12,
                        padding: "8px 12px",
                    }}
                    placeholder="Escribe un mensaje..."
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                />
                <button
                    style={{ ...s.btnSmall, margin: 6, color: "#4ecdc4", borderColor: "#2a4a4a" }}
                    onClick={onSend}
                >▶</button>
            </div>
        </div>
    );
}