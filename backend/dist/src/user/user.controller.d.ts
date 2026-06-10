import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(req: any): Promise<{
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
    updateMe(req: any, body: any): Promise<{
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
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
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
    getFriends(req: any): Promise<{
        id: number;
        username: string;
    }[]>;
    getPendingRequests(req: any): Promise<({
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
    sendRequest(req: any, toUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
    acceptRequest(req: any, fromUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
    removeFriend(req: any, otherUserId: number): Promise<{
        id: number;
        createdAt: Date;
        fromUserId: number;
        toUserId: number;
        accepted: boolean;
    }>;
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
}
