import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Player, User } from "../types";

interface UseSocketOptions {
  player1: Player | null;
  friends: User[];
  onUserConnected: (userId: number) => void;
  onUserDisconnected: (userId: number) => void;
  onOnlineFriends: (ids: number[]) => void;
  onDirectMessage: (msg: { fromUserId: number; toUserId: number; content: string; sentAt: string }) => void;
  onInvitationReceived: (data: { fromUserId: number; fromUsername: string }) => void;
  onInvitationError: (message: string) => void;
  onInvitationRejected: () => void;
  onGameStart: (data: {
    roomId: string;
    gameId: number;
    player1Id: number;
    player2Id: number;
    player1Username?: string;
    player2Username?: string;
  }) => void;
  onOnlineUsersSnapshot: (users: User[]) => void;
}

export function useSocket({
  player1,
  friends,
  onUserConnected,
  onUserDisconnected,
  onOnlineFriends,
  onDirectMessage,
  onInvitationReceived,
  onInvitationError,
  onInvitationRejected,
  onGameStart,
  onOnlineUsersSnapshot,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!player1) return;

    const socket = io("/", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token: player1.token },
      secure: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", { userId: player1.id });
      socket.emit("get_online_friends", { friendIds: friends.map((f) => f.id) });
    });

    socket.on("user_connected", ({ userId }: { userId: number }) => {
      onUserConnected(userId);
    });

    socket.on("user_disconnected", ({ userId }: { userId: number }) => {
      onUserDisconnected(userId);
    });

    socket.on("online_friends", ({ onlineIds }: { onlineIds: number[] }) => {
      onOnlineFriends(onlineIds);
    });

    socket.on("directMessage", (msg: { fromUserId: number; toUserId: number; content: string; sentAt: string }) => {
      onDirectMessage(msg);
    });

    socket.on("invitation_received", (data: { fromUserId: number; fromUsername: string }) => {
      onInvitationReceived(data);
    });

    socket.on("invitation_error", ({ message }: { message: string }) => {
      onInvitationError(message);
    });

    socket.on("invitation_rejected", () => {
      onInvitationRejected();
    });

    socket.on("game_start", (data: {
      roomId: string;
      gameId: number;
      player1Id: number;
      player2Id: number;
      player1Username?: string;
      player2Username?: string;
    }) => {
      onGameStart(data);
    });

    socket.on("online_users_snapshot", ({ users }: { users: User[] }) => {
      onOnlineUsersSnapshot(users);
    });

    const handleBeforeUnload = () => {
      socket.emit("user_leaving", { userId: player1.id });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [player1]); // eslint-disable-line react-hooks/exhaustive-deps

  // Emit get_online_friends when friends list changes
  useEffect(() => {
    if (!socketRef.current?.connected || friends.length === 0) return;
    socketRef.current.emit("get_online_friends", { friendIds: friends.map((f) => f.id) });
  }, [friends]);

  return socketRef;
}