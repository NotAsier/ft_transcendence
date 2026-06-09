export declare class ChatMetrics {
    private readonly registry;
    private connections;
    private disconnects;
    private channelMessages;
    private directMessages;
    private historyRequests;
    private latency;
    incConnections(): void;
    incDisconnects(): void;
    incChannelMessages(): void;
    incDirectMessages(): void;
    incHistoryRequests(): void;
    observeLatency(ms: number): void;
    getMetrics(): Promise<string>;
}
