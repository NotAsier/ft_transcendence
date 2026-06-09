import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private gameService;
    private prisma;
    server: Server;
    private connectedUsers;
    constructor(jwtService: JwtService, gameService: GameService, prisma: PrismaService);
    handleConnection(client: Socket): void;
    private sendOnlineUsersSnapshot;
    handleDisconnect(client: Socket): void;
    registerUser(userId: number, socketId: string): void;
    unregisterBySocketId(socketId: string): void;
    handleGetOnlineFriends(client: Socket, data: {
        friendIds: number[];
    }): void;
    handleSendInvitation(client: Socket, data: {
        toUserId: number;
        fromUsername: string;
    }): void;
    handleAcceptInvitation(client: Socket, data: {
        fromUserId: number;
        fromUsername: string;
    }): Promise<void>;
    handleRejectInvitation(client: Socket, data: {
        fromUserId: number;
    }): void;
    handleOnlineMove(client: Socket, data: {
        gameId: number;
        position: number;
        roomId: string;
    }): Promise<void>;
}
