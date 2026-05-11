import { useState, useCallback, useEffect } from "react";
import type { Player, User, FriendRequest, FriendStatus } from "../types";

const API = "/api";
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export function useSocial(player1: Player | null) {
  const [users, setUsers]         = useState<User[]>([]);
  const [friends, setFriends]     = useState<User[]>([]);
  const [requests, setRequests]   = useState<FriendRequest[]>([]);
  const [friendStatus, setFriendStatus] = useState<Record<number, FriendStatus>>({});

  const fetchUsers = async (token: string) => {
    const res  = await fetch(`${API}/user`, { headers: authHeader(token) });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchFriends = useCallback(async (token: string) => {
    const res  = await fetch(`${API}/user/friends`, { headers: authHeader(token) });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const fetchRequests = useCallback(async (token: string) => {
    const res  = await fetch(`${API}/user/friends/requests`, { headers: authHeader(token) });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const buildStatusMap = useCallback(
    (allUsers: User[], friendList: User[], pendingReqs: FriendRequest[], _myId: number) => {
      const map: Record<number, FriendStatus> = {};
      const friendIds   = new Set(friendList.map((f) => f.id));
      const receivedIds = new Set(pendingReqs.map((r) => r.fromUser.id));
      allUsers.forEach((u) => {
        if (friendIds.has(u.id))        map[u.id] = "friends";
        else if (receivedIds.has(u.id)) map[u.id] = "pending_received";
        else                            map[u.id] = "none";
      });
      return map;
    },
    []
  );

  const refreshSocial = useCallback(
    async (token: string, allUsers: User[], myId: number) => {
      const [friendList, reqs] = await Promise.all([
        fetchFriends(token),
        fetchRequests(token),
      ]);
      setFriends(friendList);
      setRequests(reqs);
      setFriendStatus(buildStatusMap(allUsers, friendList, reqs, myId));
    },
    [fetchFriends, fetchRequests, buildStatusMap]
  );

  // Polling every 5s
  useEffect(() => {
    if (!player1) return;
    const interval = setInterval(() => {
      refreshSocial(player1.token, users, player1.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [player1, users, refreshSocial]);

  const initSocial = async (token: string, myId: number) => {
    const all = (await fetchUsers(token)).filter((u: User) => u.id !== myId);
    setUsers(all);
    await refreshSocial(token, all, myId);
    return all;
  };

  const sendRequest = async (toUserId: number) => {
    if (!player1) return;
    await fetch(`${API}/user/friends/request/${toUserId}`, {
      method: "POST", headers: authHeader(player1.token),
    });
    setFriendStatus((prev) => ({ ...prev, [toUserId]: "pending_sent" }));
  };

  const acceptRequest = async (fromUserId: number) => {
    if (!player1) return;
    await fetch(`${API}/user/friends/accept/${fromUserId}`, {
      method: "POST", headers: authHeader(player1.token),
    });
    await refreshSocial(player1.token, users, player1.id);
  };

  const removeFriend = async (otherUserId: number) => {
    if (!player1) return;
    await fetch(`${API}/user/friends/${otherUserId}`, {
      method: "DELETE", headers: authHeader(player1.token),
    });
    await refreshSocial(player1.token, users, player1.id);
  };

  const loadProfile = async (userId: number, token: string) => {
    const res  = await fetch(`${API}/user/${userId}`, { headers: authHeader(token) });
    return await res.json();
  };

  return {
    users, setUsers,
    friends, setFriends,
    requests,
    friendStatus, setFriendStatus,
    refreshSocial,
    initSocial,
    sendRequest,
    acceptRequest,
    removeFriend,
    loadProfile,
  };
}