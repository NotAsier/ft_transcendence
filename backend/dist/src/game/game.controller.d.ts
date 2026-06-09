import { GameService } from './game.service';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
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
    getHistory(req: any): Promise<{
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
    getGameState(id: number): Promise<{
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
    makeMove(id: number, playerId: number, position: number): Promise<{
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
    aiMove(id: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<{
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
    getPendingGame(req: any, opponentId: number): Promise<{
        gameId: number;
        roomId: string;
        player1Id: number;
        player2Id: number | null;
        status: string;
    } | null>;
}
