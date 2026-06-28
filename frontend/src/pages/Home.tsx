import { useState, useCallback, useEffect, useRef } from "react";
import type { View, Player, User, UserProfile } from "../types";
import { useSocial } from "../hooks/useSocial";
import { useSocket } from "../hooks/useSocket";
import { useIsMobile } from "../utils/breakpoints";

import LoginView        from "../components/LoginView";
import RegisterView     from "../components/RegisterView";
import ProfilePanel     from "../components/ProfilePanel";
import GameCenter       from "../components/GameCenter";
import PlayerList       from "../components/PlayerList";
import FriendsPanel     from "../components/FriendsPanel";
import FloatingChat     from "../components/FloatingChat";
import MultiplayerModal from "../components/MultiplayerModal";
import InvitationToast  from "../components/InvitationToast";

import { makeStyles } from "../styles";
import { useTheme } from "../context/ThemeContext";
import type { ThemeName } from "../themes";

const API = "/api";
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export default function Home() {
    const [pendingGamesByUser, setPendingGamesByUser] = useState<Record<number, import('../types').PendingGame | null>>({});
    const { theme, themeName, setThemeName } = useTheme();
    const s = makeStyles(theme);
    const [view, setView]       = useState<View>("home");
    const [player1, setPlayer1] = useState<Player | null>(null);
    const [player2, setPlayer2] = useState<User | null>(null);
    const [error, setError]     = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

    // Online game state
    const [isOnlineGame, setIsOnlineGame]       = useState(false);
    const [isAIGame, setIsAIGame]               = useState(false);
    const [aiDifficulty, setAiDifficulty]       = useState<"easy" | "medium" | "hard" | null>(null);
    const [onlineGameId, setOnlineGameId]       = useState<number | null>(null);
    const [onlineRoomId, setOnlineRoomId]       = useState<string | null>(null);
    const [onlinePlayer1Id, setOnlinePlayer1Id] = useState<number | null>(null);

    // Invitations
    const [showMultiModal, setShowMultiModal]       = useState(false);
    const [pendingInvitation, setPendingInvitation] = useState<{ fromUserId: number; fromUsername: string } | null>(null);
    const [invitationSent, setInvitationSent]       = useState<number | null>(null);
    const [onlineFriends, setOnlineFriends]         = useState<number[]>([]);
    const [onlinePlayers, setOnlinePlayers]         = useState<User[]>([]);

    // Chat
    const [chatWith, setChatWith]         = useState<User | null>(null);
    const [chatMessages, setChatMessages] = useState<Record<number, { fromUserId: number; content: string; sentAt: string }[]>>({});
    const [chatInput, setChatInput]       = useState("");

    // Carousel state for mobile/tablet
    const isMobile = useIsMobile();
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    // Social hook
    const {
        users, friends, requests, friendStatus,
        initSocial, sendRequest, acceptRequest, removeFriend, loadProfile,
    } = useSocial(player1);

    // Cargar partidas pendientes
    useEffect(() => {
        async function fetchPendingGames() {
            if (!player1) return;
            const result: Record<number, import('../types').PendingGame | null> = {};
            const allUsers = [...friends];
            await Promise.all(allUsers.map(async (f) => {
                try {
                    const res = await fetch(`/api/game/pending/${f.id}`, { headers: authHeader(player1.token) });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.status === 'playing') {
                            result[f.id] = data;
                            return;
                        }
                    }
                } catch {}
                result[f.id] = null;
            }));
            setPendingGamesByUser(result);
        }
        fetchPendingGames();
    }, [player1, friends]);

    // ── Google OAuth redirect ─────────────────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token  = params.get("token");
        if (!token) return;

        window.history.replaceState({}, "", "/");

        fetch(`${API}/user/me`, { headers: authHeader(token) })
            .then((r) => r.json())
            .then(async (me) => {
                const p1: Player = {
                    id: me.id, username: me.username, token,
                    email: me.email, displayName: me.displayName,
                    country: me.country, gender: me.gender,
                    birthDate: me.birthDate, wins: me.wins,
                };
                setPlayer1(p1);
                await initSocial(token, me.id);
                setView("lobby");
            })
            .catch(() => setError("Error al iniciar sesion con Google"));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Socket hook ───────────────────────────────────────────────────────
    const socketRef = useSocket({
        player1,
        friends,
        onUserConnected: useCallback(async (userId: number) => {
            if (player1) {
                const user = await loadProfile(userId, player1.token);
                if (user) {
                    setOnlinePlayers((prev) => {
                        if (!prev.some((p) => p.id === user.id)) return [...prev, user];
                        return prev;
                    });
                }
            }
        }, [player1, loadProfile]),
        onUserDisconnected: useCallback((userId: number) => {
            setOnlinePlayers((prev) => prev.filter((p) => p.id !== userId));
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
        onOnlineUsersSnapshot: useCallback((users: User[]) => {
            setOnlinePlayers(users.filter((u) => u.id !== player1?.id));
        }, [player1]),
    });

    // ── Carousel drag handlers ────────────────────────────────────────────
    const handleTouchStart = (e: React.TouchEvent) => {
        // Solo si tenemos el carrusel ref, iniciamos el drag
        if (!carouselRef.current || e.touches.length !== 1) return;
        
        setIsDragging(true);
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !touchStartRef.current || e.touches.length !== 1) return;

        const currentX = e.touches[0].clientX;
        const deltaX = touchStartRef.current.x - currentX;
        
        // Permitir drag suave hasta el siguiente/anterior índice
        // dragOffset es negativo para swipe left (siguiente), positivo para swipe right (anterior)
        setDragOffset(-deltaX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isDragging || !touchStartRef.current) return;
        
        const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const deltaX = touchStartRef.current.x - touchEnd.x;
        const minSwipeDistance = window.innerWidth * 0.3; // 30% threshold

        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe left - next column
                setCarouselIndex((prev) => Math.min(prev + 1, 2));
            } else {
                // Swipe right - previous column
                setCarouselIndex((prev) => Math.max(prev - 1, 0));
            }
        }

        setDragOffset(0);
        setIsDragging(false);
        touchStartRef.current = null;
    };

    // ── Auth ──────────────────────────────────────────────────────────────
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
                gender: me.gender, birthDate: me.birthDate, wins: me.wins, avatarUrl: me.avatarUrl,
            };
            setPlayer1(p1);
            await initSocial(data.access_token, me.id);
            setView("lobby");
        } catch (e: any) { setError(e.message || "Error al registrarse"); }
        setLoading(false);
    };

    // ── Game actions ──────────────────────────────────────────────────────
    const startLocalGame = async () => {
        if (!player1) return;
        const res   = await fetch(`${API}/user/guest`, { headers: authHeader(player1.token) });
        const guest = await res.json();
        if (guest?.id) setPlayer2(guest);
    };

    const startAIGame = async (difficulty: "easy" | "medium" | "hard") => {
        const res = await fetch(`/api/user/guest`, {
            headers: { Authorization: `Bearer ${player1!.token}` },
        });
        const guest = await res.json();
        if (guest?.id) {
            setIsAIGame(true);
            setAiDifficulty(difficulty);
            setPlayer2(guest);
        }
    };

    const handleExitGame = () => {
        setPlayer2(null);
        setIsOnlineGame(false);
        setIsAIGame(false);
        setAiDifficulty(null);
        setOnlineGameId(null);
        setOnlineRoomId(null);
        setOnlinePlayer1Id(null);
    };

    const handleReconnectGame = (pending: import('../types').PendingGame) => {
        if (!player1) return;
        const opponentId = pending.player1Id === player1.id ? pending.player2Id : pending.player1Id;
        const opponent =
            users.find(u => u.id === opponentId) ??
            friends.find(f => f.id === opponentId) ??
            { id: opponentId, username: "Rival" };
        setPlayer2(opponent);
        setOnlineGameId(pending.gameId);
        setOnlinePlayer1Id(pending.player1Id);
        setOnlineRoomId(pending.roomId);
        setIsOnlineGame(true);
    };

    const handleGameEnd = (_gameId: number, opponentId: number) => {
        setPendingGamesByUser(prev => ({ ...prev, [opponentId]: null }));
    };

    // ── Invitation actions ────────────────────────────────────────────────
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

    // ── Chat actions ──────────────────────────────────────────────────────
    const handleSendChat = () => {
        if (!player1 || !chatInput.trim() || !socketRef.current || !chatWith) return;
        socketRef.current.emit("directMessage", {
            fromUserId: player1.id,
            toUserId: chatWith.id,
            content: chatInput.trim(),
        });
        setChatInput("");
    };

    // ── Profile ───────────────────────────────────────────────────────────
    const handleLoadProfile = async (userId: number) => {
        if (!player1) return;
        const profile = await loadProfile(userId, player1.token);
        setSelectedProfile(profile);
    };

    const handleLogout = () => {
        setView("home");
        setPlayer1(null);
    };

    const updateProfile = async (data: any) => {
        if (!player1) return;
        const res = await fetch("/api/user/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${player1.token}` },
            body: JSON.stringify(data),
        });
        const updated = await res.json();
        setPlayer1((prev) => prev ? { ...prev, ...updated } : prev);
    };

    const uploadAvatar = async (file: File) => {
        if (!player1) return;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/user/avatar", {
            method: "POST",
            headers: { Authorization: `Bearer ${player1.token}` },
            body: formData,
        });
        const updated = await res.json();
        setPlayer1((prev) => prev ? { ...prev, ...updated } : prev);
    };

    // ── Temas disponibles ─────────────────────────────────────────────────
    const themeOptions: { key: ThemeName; label: string }[] = [
        { key: "dark",  label: "DARK"  },
        { key: "retro", label: "RETRO" },
        { key: "light", label: "LIGHT" },
        { key: "lila",  label: "LILA"  },
    ];

    // ── LOBBY VIEW ────────────────────────────────────────────────────────
    if (view === "lobby" && player1) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", width: "100vw", height: "100vh",
                background: theme.background, fontFamily: "'Courier New', monospace",
                boxSizing: "border-box", padding: 20, gap: 16,
            }}>
                {/* Main row - Desktop layout or Carousel for mobile/tablet */}
                {isMobile ? (
                    // MOBILE/TABLET: Carousel layout
                    <div
                        ref={carouselRef}
                        className="carousel-container"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{ flex: 1, minHeight: 0 }}
                    >
                        <div
                            className={`carousel-inner${isDragging ? ' dragging' : ''}`}
                            style={{
                                transform: `translateX(calc(-${carouselIndex} * 100vw + ${dragOffset}px))`,
                            }}
                        >
                            {/* Column 1: Profile Panel */}
                            <div className="carousel-column" style={{ flex: "0 0 100vw" }}>
                                <ProfilePanel
                                    player1={player1}
                                    selectedProfile={selectedProfile}
                                    onClearProfile={() => setSelectedProfile(null)}
                                    onLogout={handleLogout}
                                    onUpdateProfile={updateProfile}
                                    onUploadAvatar={uploadAvatar}
                                />
                            </div>

                            {/* Column 2: Game Center */}
                            <div className="carousel-column" style={{ flex: "0 0 100vw" }}>
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
                                    onStartAI={startAIGame}
                                    isAIGame={isAIGame}
                                    aiDifficulty={aiDifficulty}
                                    onGameEnd={handleGameEnd}
                                />
                            </div>

                            {/* Column 3: Player List & Friends */}
                            <div className="carousel-column" style={{ flex: "0 0 100vw" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0 }}>
                                    <PlayerList
                                        users={onlinePlayers.filter((u) => u.id !== player1.id)}
                                        friendStatus={friendStatus}
                                        pendingGames={pendingGamesByUser}
                                        onSendRequest={sendRequest}
                                        onReconnectGame={handleReconnectGame}
                                        onLoadProfile={handleLoadProfile}
                                    />
                                    <FriendsPanel
                                        friends={friends}
                                        requests={requests}
                                        onlineFriends={onlineFriends}
                                        pendingGames={pendingGamesByUser}
                                        onAcceptRequest={acceptRequest}
                                        onRemoveFriend={removeFriend}
                                        onReconnectGame={handleReconnectGame}
                                        onOpenChat={setChatWith}
                                        onLoadProfile={handleLoadProfile}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // DESKTOP: Original 3-column layout
                    <div style={{ display: "flex", flex: 1, gap: 16, minHeight: 0 }}>
                        <ProfilePanel
                            player1={player1}
                            selectedProfile={selectedProfile}
                            onClearProfile={() => setSelectedProfile(null)}
                            onLogout={handleLogout}
                            onUpdateProfile={updateProfile}
                            onUploadAvatar={uploadAvatar}
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
                            onStartAI={startAIGame}
                            isAIGame={isAIGame}
                            aiDifficulty={aiDifficulty}
                            onGameEnd={handleGameEnd}
                        />
                        {/* Right column */}
                        <div style={{ flex: "0 0 24%", display: "flex", flexDirection: "column", gap: 16 }}>
                            <PlayerList
                                users={onlinePlayers.filter((u) => u.id !== player1.id)}
                                friendStatus={friendStatus}
                                pendingGames={pendingGamesByUser}
                                onSendRequest={sendRequest}

                                onReconnectGame={handleReconnectGame}
                                onLoadProfile={handleLoadProfile}
                            />
                            <FriendsPanel
                                friends={friends}
                                requests={requests}
                                onlineFriends={onlineFriends}
                                pendingGames={pendingGamesByUser}
                                onAcceptRequest={acceptRequest}
                                onRemoveFriend={removeFriend}
                                onReconnectGame={handleReconnectGame}
                                onOpenChat={setChatWith}
                                onLoadProfile={handleLoadProfile}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom bar */}
                <div style={{
                    background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8,
                    padding: isMobile ? "8px 12px" : "12px 32px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: isMobile ? "center" : "space-between",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    gap: isMobile ? 8 : 16,
                }}>
                    <h1 style={{ margin: 0, fontSize: isMobile ? 14 : 22, fontWeight: "bold", letterSpacing: isMobile ? 2 : 6, color: theme.text, order: isMobile ? 1 : 0 }}>
                        FT TRANSCENDENCE
                    </h1>

  					{/* Selector de temas */}
                    <div style={{ display: "flex", gap: 4, order: isMobile ? 3 : 1, flexBasis: isMobile ? "100%" : "auto", justifyContent: isMobile ? "center" : "flex-start" }}>
                        {themeOptions.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setThemeName(key)}
                                style={{
                                    ...s.btnSmall,
                                    borderColor: themeName === key ? theme.text : theme.border,
                                    color: themeName === key ? theme.text : theme.textDim,
                                    fontWeight: themeName === key ? "bold" : "normal",
                                    letterSpacing: 1,
                                    padding: isMobile ? "2px 6px" : "4px 12px",
                                    fontSize: isMobile ? 10 : 12,
                                }}
                            >
                                {isMobile ? label.charAt(0) : label}
                            </button>
                        ))}
                    </div>

                    {/* Legal links */}
                    <div style={{ display: isMobile ? "none" : "flex", gap: 16, order: 2 }}>
                        <a
                            href="/privacy-policy" target="_blank"
                            style={{ fontSize: 10, color: theme.textDim, letterSpacing: 1,
                                textDecoration: "none", opacity: 0.6 }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
                        >
                            PRIVACY POLICY
                        </a>
                        <a
                            href="/terms-of-service" target="_blank"
                            style={{ fontSize: 10, color: theme.textDim, letterSpacing: 1,
                                textDecoration: "none", opacity: 0.6 }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
                        >
                            TERMS OF SERVICE
                        </a>
                    </div>

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

    // ── HOME / AUTH VIEWS ─────────────────────────────────────────────────
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