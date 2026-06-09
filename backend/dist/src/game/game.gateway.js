"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const game_service_1 = require("./game.service");
const prisma_service_1 = require("../prisma/prisma.service");
let GameGateway = class GameGateway {
    jwtService;
    gameService;
    prisma;
    server;
    connectedUsers = new Map();
    constructor(jwtService, gameService, prisma) {
        this.jwtService = jwtService;
        this.gameService = gameService;
        this.prisma = prisma;
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.userId = payload.sub;
            this.connectedUsers.set(payload.sub, client.id);
            console.log(`[Game] Usuario ${payload.sub} conectado (${client.id})`);
            this.server.emit('user_connected', { userId: payload.sub });
            this.sendOnlineUsersSnapshot(client, payload.sub);
        }
        catch {
            if (client.handshake.auth?.token) {
                client.disconnect();
            }
        }
    }
    async sendOnlineUsersSnapshot(client, currentUserId) {
        const otherOnlineUserIds = Array.from(this.connectedUsers.keys())
            .filter(id => id !== currentUserId);
        if (otherOnlineUserIds.length > 0) {
            const otherOnlineUsers = await this.gameService.getUsersByIds(otherOnlineUserIds);
            client.emit('online_users_snapshot', { users: otherOnlineUsers });
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`[Game] Usuario ${userId} desconectado`);
            this.server.emit('user_disconnected', { userId });
        }
    }
    registerUser(userId, socketId) {
        this.connectedUsers.set(userId, socketId);
    }
    unregisterBySocketId(socketId) {
        for (const [userId, sid] of this.connectedUsers) {
            if (sid === socketId) {
                this.connectedUsers.delete(userId);
                break;
            }
        }
    }
    handleGetOnlineFriends(client, data) {
        const onlineIds = data.friendIds.filter(id => this.connectedUsers.has(id));
        client.emit('online_friends', { onlineIds });
    }
    handleSendInvitation(client, data) {
        const fromUserId = client.data.userId;
        const toSocketId = this.connectedUsers.get(data.toUserId);
        if (!toSocketId) {
            client.emit('invitation_error', { message: 'El usuario no está conectado' });
            return;
        }
        this.server.to(toSocketId).emit('invitation_received', {
            fromUserId,
            fromUsername: data.fromUsername,
        });
        client.emit('invitation_sent', { toUserId: data.toUserId });
    }
    async handleAcceptInvitation(client, data) {
        const player2Id = client.data.userId;
        const fromSocketId = this.connectedUsers.get(data.fromUserId);
        if (!fromSocketId) {
            client.emit('invitation_error', { message: 'El usuario ya no está conectado' });
            return;
        }
        try {
            const game = await this.gameService.createGame(data.fromUserId);
            await this.gameService.joinGame(game.id, player2Id);
            const roomId = `game_${game.id}`;
            client.join(roomId);
            const fromSocket = this.server.sockets.sockets.get(fromSocketId);
            fromSocket?.join(roomId);
            const [p1, p2] = await Promise.all([
                this.prisma.user.findUnique({ where: { id: data.fromUserId }, select: { username: true } }),
                this.prisma.user.findUnique({ where: { id: player2Id }, select: { username: true } }),
            ]);
            this.server.to(roomId).emit('game_start', {
                roomId,
                gameId: game.id,
                player1Id: data.fromUserId,
                player2Id,
                player1Username: p1?.username,
                player2Username: p2?.username,
            });
            console.log(`[Game] Partida ${game.id} iniciada en sala ${roomId}`);
        }
        catch (e) {
            client.emit('invitation_error', { message: e.message });
        }
    }
    handleRejectInvitation(client, data) {
        const fromSocketId = this.connectedUsers.get(data.fromUserId);
        if (fromSocketId) {
            this.server.to(fromSocketId).emit('invitation_rejected', {
                byUserId: client.data.userId,
            });
        }
    }
    async handleOnlineMove(client, data) {
        const playerId = client.data.userId;
        if (!playerId) {
            client.emit('move_error', { message: 'No autenticado' });
            return;
        }
        try {
            const updatedGame = await this.gameService.makeMove(data.gameId, playerId, data.position);
            this.server.to(data.roomId).emit('game_updated', {
                board: updatedGame.board,
                status: updatedGame.status,
                winner: updatedGame.winner,
            });
            if (updatedGame.status === 'finished') {
                this.server.to(data.roomId).emit('game_over', {
                    winner: updatedGame.winner,
                    board: updatedGame.board,
                });
                console.log(`[Game] Partida ${data.gameId} terminada. Ganador: ${updatedGame.winner}`);
            }
        }
        catch (e) {
            client.emit('move_error', { message: e.message });
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_online_friends'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleGetOnlineFriends", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_invitation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleSendInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accept_invitation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleAcceptInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reject_invitation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleRejectInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('online_move'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleOnlineMove", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        game_service_1.GameService,
        prisma_service_1.PrismaService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map