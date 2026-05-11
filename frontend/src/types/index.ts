export type View = "home" | "login" | "register" | "lobby" | "game";

export interface User {
  id: number;
  username: string;
}

export interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  wins?: number;
}

export interface Player {
  id: number;
  username: string;
  token: string;
  email?: string;
  displayName?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  wins?: number;
}

export interface FriendRequest {
  id: number;
  fromUser: User;
}

export type FriendStatus = "none" | "pending_sent" | "pending_received" | "friends";
