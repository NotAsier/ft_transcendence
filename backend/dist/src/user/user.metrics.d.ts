export declare class UserMetrics {
    private readonly usersCreated;
    private readonly userLogins;
    private readonly usersOnline;
    private onlineCount;
    incCreated(): void;
    incLogin(): void;
    incOnline(): void;
    decOnline(): void;
    setOnline(value: number): void;
}
