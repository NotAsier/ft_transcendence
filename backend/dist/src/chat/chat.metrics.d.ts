export declare class ChatMetrics {
    private readonly connections;
    private readonly disconnects;
    private readonly channelMessages;
    private readonly directMessages;
    private readonly historyRequests;
    private readonly latency;
    incConnections(): void;
    incDisconnects(): void;
    incChannelMessages(): void;
    incDirectMessages(): void;
    incHistoryRequests(): void;
    observeLatency(ms: number): void;
    getMetrics(): Promise<string>;
}
