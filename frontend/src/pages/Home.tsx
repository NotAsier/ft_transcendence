import { useState, useCallback } from "react";
import type { View, Player, User, UserProfile } from "../types";
import { useSocial } from "../hooks/useSocial";
import { useSocket } from "../hooks/useSocket";

import LoginView        from "../components/LoginView";
import RegisterView     from "../components/RegisterView";
import ProfilePanel     from "../components/ProfilePanel";
import GameCenter       from "../components/GameCenter";
import PlayerList       from "../components/PlayerList";
import FriendsPanel     from "../components/FriendsPanel";
import FloatingChat     from "../components/FloatingChat";
import MultiplayerModal from "../components/MultiplayerModal";
import InvitationToast  from "../components/InvitationToast";

import { s } from "../styles";

const API = "/api";
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export default function Home() {
  const [view, setView]       = useState<View>("home");
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<User | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  // Online game state
  const [isOnlineGame, setIsOnlineGame]       = useState(false);
  const [onlineGameId, setOnlineGameId]       = useState<number | null>(null);
  const [onlineRoomId, setOnlineRoomId]       = useState<string | null>(null);
  const [onlinePlayer1Id, setOnlinePlayer1Id] = useState<number | null>(null);

  // Invitations
  const [showMultiModal, setShowMultiModal]     = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<{ fromUserId: number; fromUsername: string } | null>(null);
  const [invitationSent, setInvitationSent]     = useState<number | null>(null);
  const [onlineFriends, setOnlineFriends]       = useState<number[]>([]);

  // Chat
  const [chatWith, setChatWith]   = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, { fromUserId: number; content: string; sentAt: string }[]>>({});
  const [chatInput, setChatInput] = useState("");

  // Social hook
  const {
    users, friends, requests, friendStatus,
    initSocial, sendRequest, acceptRequest, removeFriend, loadProfile,
  } = useSocial(player1);

  // ── Socket hook ──────────────────────────────────────────────────────────────
  const socketRef = useSocket({
    player1,
    friends,
    onUserConnected: useCallback((userId: number) => {
      if (friends.some((f) => f.id === userId)) {
        setOnlineFriends((prev) => [...new Set([...prev, userId])]);
      }
    }, [friends]),
    onUserDisconnected: useCallback((userId: number) => {
      setOnlineFriends((prev) => prev.filter((id) => id !== userId));
    }, []),
    onOnlineFriends: useCallback((ids: number[]) => {
      setOnlineFriends(ids);
    }, []),
    onDirectMessage: useCallback((msg) => {
      const peerId = msg.fromUserId === player1?.id ? msg.toUserId : msg.fromUserId;
      setChatMessages((prev) => ({
        ...prev,
        [peerId]: [...(prev[peerId] || []), msg],
      }));
    }, [player1?.id]),
    onInvitationReceived: useCallback((data) => {
      setPendingInvitation(data);
    }, []),
    onInvitationError: useCallback((message: string) => {
      setInvitationSent(null);
      setError(message);
    }, []),
    onInvitationRejected: useCallback(() => {
      setInvitationSent(null);
      setError("El jugador rechazó la invitación");
    }, []),
    onGameStart: useCallback((data) => {
      if (!player1) return;
      setPendingInvitation(null);
      setInvitationSent(null);
      setShowMultiModal(false);

      const opponentId = data.player1Id === player1.id ? data.player2Id : data.player1Id;
      const opponentUsername = data.player1Id === player1.id ? data.player2Username : data.player1Username;

      const opponent =
        users.find((u) => u.id === opponentId) ??
        friends.find((f) => f.id === opponentId) ??
        { id: opponentId, username: opponentUsername ?? "Rival" };

      setOnlineGameId(data.gameId);
      setOnlinePlayer1Id(data.player1Id);
      setOnlineRoomId(data.roomId);
      setIsOnlineGame(true);
      setPlayer2(opponent);
    }, [player1, users, friends]),
  });

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.statusCode) throw new Error(data.message);

      const me = await (await fetch(`${API}/user/me`, { headers: authHeader(data.access_token) })).json();
      const p1: Player = {
        id: me.id, username: me.username, token: data.access_token,
        email: me.email, displayName: me.displayName, country: me.country,
        gender: me.gender, birthDate: me.birthDate, wins: me.wins,
      };
      setPlayer1(p1);
      await initSocial(data.access_token, me.id);
      setView("lobby");
    } catch (e: any) { setError(e.message || "Error al iniciar sesión"); }
    setLoading(false);
  };

  const handleRegister = async (formData: {
    email: string; username: string; password: string;
    birthDate?: string; country?: string; gender?: string;
  }) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.statusCode) throw new Error(data.message);

      const me = await (await fetch(`${API}/user/me`, { headers: authHeader(data.access_token) })).json();
      const p1: Player = {
        id: me.id, username: me.username, token: data.access_token,
        email: me.email, displayName: me.displayName, country: me.country,
        gender: me.gender, birthDate: me.birthDate, wins: me.wins,
      };
      setPlayer1(p1);
      await initSocial(data.access_token, me.id);
      setView("lobby");
    } catch (e: any) { setError(e.message || "Error al registrarse"); }
    setLoading(false);
  };

  // ── Game actions ─────────────────────────────────────────────────────────────
  const startLocalGame = async () => {
    if (!player1) return;
    const res   = await fetch(`${API}/user/guest`, { headers: authHeader(player1.token) });
    const guest = await res.json();
    if (guest?.id) setPlayer2(guest);
  };

  const handleExitGame = () => {
    setPlayer2(null);
    setIsOnlineGame(false);
    setOnlineGameId(null);
    setOnlineRoomId(null);
    setOnlinePlayer1Id(null);
  };

  // ── Invitation actions ────────────────────────────────────────────────────────
  const sendInvitation = (toUser: User) => {
    if (!socketRef.current || !player1) return;
    socketRef.current.emit("send_invitation", { toUserId: toUser.id, fromUsername: player1.username });
    setInvitationSent(toUser.id);
    setShowMultiModal(false);
  };

  const acceptInvitation = () => {
    if (!socketRef.current || !pendingInvitation) return;
    socketRef.current.emit("accept_invitation", {
      fromUserId: pendingInvitation.fromUserId,
      fromUsername: pendingInvitation.fromUsername,
    });
    setPendingInvitation(null);
  };

  const rejectInvitation = () => {
    if (!socketRef.current || !pendingInvitation) return;
    socketRef.current.emit("reject_invitation", { fromUserId: pendingInvitation.fromUserId });
    setPendingInvitation(null);
  };

  // ── Chat actions ──────────────────────────────────────────────────────────────
  const handleSendChat = () => {
    if (!player1 || !chatInput.trim() || !socketRef.current || !chatWith) return;
    socketRef.current.emit("directMessage", {
      fromUserId: player1.id,
      toUserId: chatWith.id,
      content: chatInput.trim(),
    });
    setChatInput("");
  };

  // ── Profile ───────────────────────────────────────────────────────────────────
  const handleLoadProfile = async (userId: number) => {
    if (!player1) return;
    const profile = await loadProfile(userId, player1.token);
    setSelectedProfile(profile);
  };

  const handleLogout = () => {
    setView("home");
    setPlayer1(null);
  };

  // ── LOBBY VIEW ────────────────────────────────────────────────────────────────
  if (view === "lobby" && player1) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", width: "100vw", height: "100vh",
        background: "#0f0f0f", fontFamily: "'Courier New', monospace",
        boxSizing: "border-box", padding: 20, gap: 16,
      }}>

        {/* Main row */}
        <div style={{ display: "flex", flex: 1, gap: 16, minHeight: 0 }}>

          <ProfilePanel
            player1={player1}
            selectedProfile={selectedProfile}
            onClearProfile={() => setSelectedProfile(null)}
            onLogout={handleLogout}
          />

          <GameCenter
            player1={player1}
            player2={player2}
            isOnlineGame={isOnlineGame}
            onlineRoomId={onlineRoomId}
            onlineGameId={onlineGameId}
            onlinePlayer1Id={onlinePlayer1Id}
            invitationSent={invitationSent}
            socket={socketRef.current}
            onStartLocal={startLocalGame}
            onOpenMultiModal={() => setShowMultiModal(true)}
            onExitGame={handleExitGame}
          />

          {/* Right column */}
          <div style={{ flex: "0 0 24%", display: "flex", flexDirection: "column", gap: 16 }}>
            <PlayerList
              users={users}
              friendStatus={friendStatus}
              onSendRequest={sendRequest}
              onAcceptRequest={acceptRequest}
              onRemoveFriend={removeFriend}
              onStartGame={setPlayer2}
              onLoadProfile={handleLoadProfile}
            />
            <FriendsPanel
              friends={friends}
              requests={requests}
              onlineFriends={onlineFriends}
              onAcceptRequest={acceptRequest}
              onRemoveFriend={removeFriend}
              onStartGame={setPlayer2}
              onOpenChat={setChatWith}
              onLoadProfile={handleLoadProfile}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8,
          padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold", letterSpacing: 6, color: "#fff" }}>
            FT TRANSCENDENCE
          </h1>
        </div>

        {/* Floating chat */}
        {chatWith && (
          <FloatingChat
            chatWith={chatWith}
            player1={player1}
            messages={chatMessages[chatWith.id] || []}
            input={chatInput}
            socket={socketRef.current}
            onInputChange={setChatInput}
            onSend={handleSendChat}
            onClose={() => setChatWith(null)}
          />
        )}

        {/* Multiplayer modal */}
        {showMultiModal && (
          <MultiplayerModal
            friends={friends}
            onlineFriends={onlineFriends}
            onInvite={sendInvitation}
            onClose={() => setShowMultiModal(false)}
          />
        )}

        {/* Invitation toast */}
        {pendingInvitation && (
          <InvitationToast
            fromUsername={pendingInvitation.fromUsername}
            onAccept={acceptInvitation}
            onReject={rejectInvitation}
          />
        )}
      </div>
    );
  }

  // ── HOME / AUTH VIEWS ─────────────────────────────────────────────────────────
  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <h1 style={s.title}>FT TRANSCENDENCE</h1>
        <p style={s.subtitle}>Tic Tac Toe</p>

        {view === "home" && (
          <div style={s.btnGroup}>
            <button style={{ ...s.btn, ...s.btnPrimary }}
              onClick={() => { setView("login"); setError(null); }}>
              Sign In
            </button>
            <button style={{ ...s.btn, ...s.btnSecondary }}
              onClick={() => { setView("register"); setError(null); }}>
              Sign Up
            </button>
          </div>
        )}

        {view === "login" && (
          <LoginView
            onSuccess={handleLogin}
            onBack={() => { setView("home"); setError(null); }}
            loading={loading}
            error={error}
          />
        )}

        {view === "register" && (
          <RegisterView
            onSuccess={handleRegister}
            onBack={() => { setView("home"); setError(null); }}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}