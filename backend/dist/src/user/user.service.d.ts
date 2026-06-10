import { PrismaService } from '../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: number): Promise<{
        id: number;
        email: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        wins: number;
        birthDate: Date | null;
        country: string | null;
        gender: string | null;
    } | null>;
    updateMe(userId: number, data: any): Promise<{
        id: number;
        email: string;
        username: string;
        oauthId: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        oauthProvider: string | null;
        password: string | null;
        wins: number;
        birthDate: Date | null;
        country: string | null;
        gender: string | null;
    }>;
    getAll(): Promise<{
        id: number;
        username: string;
    }[]>;
    sendFriendRequest(fromUserId: number, toUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
    acceptFriendRequest(userId: number, fromUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
    removeFriend(userId: number, otherUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
    getPendingRequests(userId: number): Promise<({
        fromUser: {
            id: number;
            username: string;
        };
    } & {
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    })[]>;
    getUser(id: number): Promise<{
        id: number;
        username: string;
        displayName: string | null;
        createdAt: Date;
        wins: number;
        birthDate: Date | null;
        country: string | null;
        gender: string | null;
    } | null>;
    getFriends(userId: number): Promise<{
        id: number;
        username: string;
    }[]>;
    getGuest(): Promise<{
        id: number;
        username: string;
    } | null>;
    getLeaderboard(): Promise<{
        id: number;
        username: string;
        displayName: string | null;
        wins: number;
        country: string | null;
    }[]>;
}
