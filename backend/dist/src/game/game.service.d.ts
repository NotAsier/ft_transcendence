import { PrismaService } from '../prisma/prisma.service';
export declare class GameService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUsersByIds(ids: number[]): Promise<{
        id: number;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
    }[]>;
    createGame(player1Id: number): Promise<{
        id: number;
        isVsAI: boolean;
        winner: string | null;
        board: string;
        status: string;
        customRules: import("@prisma/client/runtime/library").JsonValue | null;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        player1Id: number;
        player2Id: number | null;
    }>;
    joinGame(gameId: number, player2Id: number): Promise<{
        id: number;
        isVsAI: boolean;
        winner: string | null;
        board: string;
        status: string;
        customRules: import("@prisma/client/runtime/library").JsonValue | null;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        player1Id: number;
        player2Id: number | null;
    }>;
    getGameState(gameId: number): Promise<{
        player1: {
            id: number;
            username: string;
            avatarUrl: string | null;
        };
        player2: {
            id: number;
            username: string;
            avatarUrl: string | null;
        } | null;
    } & {
        id: number;
        isVsAI: boolean;
        winner: string | null;
        board: string;
        status: string;
        customRules: import("@prisma/client/runtime/library").JsonValue | null;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        player1Id: number;
        player2Id: number | null;
    }>;
    makeMove(gameId: number, playerId: number, position: number): Promise<{
        id: number;
        isVsAI: boolean;
        winner: string | null;
        board: string;
        status: string;
        customRules: import("@prisma/client/runtime/library").JsonValue | null;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        player1Id: number;
        player2Id: number | null;
    }>;
    getHistory(userId: number): Promise<{
        id: number;
        isVsAI: boolean;
        player1: {
            id: number;
            username: string;
            displayName: string | null;
        };
        player2: {
            id: number;
            username: string;
            displayName: string | null;
        } | null;
        winner: string | null;
        board: string;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        result: "draw" | "win" | "loss";
        opponentName: string;
        playerMark: string;
    }[]>;
    private checkWinner;
    private printBoard;
    aiMove(gameId: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<{
        id: number;
        isVsAI: boolean;
        winner: string | null;
        board: string;
        status: string;
        customRules: import("@prisma/client/runtime/library").JsonValue | null;
        score1: number;
        score2: number;
        playedAt: Date;
        finishedAt: Date | null;
        player1Id: number;
        player2Id: number | null;
    }>;
    private randomMove;
    private bestMove;
    private minimax;
    private checkWinnerForMark;
    getPendingGame(userId: number, opponentId: number): Promise<{
        gameId: number;
        roomId: string;
        player1Id: number;
        player2Id: number | null;
        status: string;
    } | null>;
}
