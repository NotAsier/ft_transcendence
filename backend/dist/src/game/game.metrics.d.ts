export declare class GameMetrics {
    private readonly gamesCreated;
    private readonly gamesStarted;
    private readonly gamesFinished;
    private readonly moves;
    private readonly activeGames;
    private readonly moveLatency;
    incCreated(): void;
    incStarted(): void;
    incFinished(): void;
    incMove(): void;
    setActive(value: number): void;
    observeMoveLatency(value: number): void;
}
