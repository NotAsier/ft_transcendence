import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatMetrics } from './chat.metrics';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly metrics;
    server: Server;
    private userSockets;
    constructor(chatService: ChatService, metrics: ChatMetrics);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(data: {
        userId: number;
    }, client: Socket): void;
    handleMessage(data: {
        content: string;
        channelId: number;
        authorId: number;
    }): Promise<void>;
    handleDirectMessage(data: {
        fromUserId: number;
        toUserId: number;
        content: string;
    }, client: Socket): Promise<void>;
    handleGetMessages(data: {
        channelId: number;
    }, client: Socket): Promise<void>;
    handleGetDirectHistory(data: {
        userId1: number;
        userId2: number;
    }, client: Socket): Promise<void>;
}
