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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const chat_metrics_1 = require("./chat.metrics");
let ChatGateway = class ChatGateway {
    chatService;
    metrics;
    server;
    userSockets = new Map();
    constructor(chatService, metrics) {
        this.chatService = chatService;
        this.metrics = metrics;
    }
    handleConnection(client) {
        console.log('[CHAT] connect', client.id);
        const userId = client.data?.userId;
        if (userId) {
            this.userSockets.set(userId, client.id);
        }
    }
    handleDisconnect(client) {
        this.metrics.incDisconnects();
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }
    handleRegister(data, client) {
        this.userSockets.set(data.userId, client.id);
        client.data.userId = data.userId;
        this.metrics.incConnections();
    }
    async handleMessage(data) {
        const start = Date.now();
        const message = await this.chatService.saveMessage(data.content, data.authorId, data.channelId);
        this.server.emit('newMessage', {
            content: message.content,
            channelId: message.channelId,
            authorId: message.authorId,
            sentAt: message.sentAt,
        });
        this.metrics.incChannelMessages();
        this.metrics.observeLatency(Date.now() - start);
    }
    async handleDirectMessage(data, client) {
        const start = Date.now();
        const saved = await this.chatService.saveDirectMessage(data.content, data.fromUserId, data.fromUserId, data.toUserId);
        const payload = {
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            content: data.content,
            sentAt: saved.sentAt.toISOString(),
        };
        const targetSocket = this.userSockets.get(data.toUserId);
        if (targetSocket) {
            this.server.to(targetSocket).emit('directMessage', payload);
        }
        client.emit('directMessage', payload);
        this.metrics.incDirectMessages();
        this.metrics.observeLatency(Date.now() - start);
    }
    async handleGetMessages(data, client) {
        const messages = await this.chatService.getMessages(data.channelId);
        this.metrics.incHistoryRequests();
        client.emit('messageHistory', messages);
    }
    async handleGetDirectHistory(data, client) {
        const start = Date.now();
        const history = await this.chatService.getDirectMessages(data.userId1, data.userId2);
        this.metrics.incHistoryRequests();
        client.emit('directHistory', history);
        this.metrics.observeLatency(Date.now() - start);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('directMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDirectMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getMessages'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getDirectHistory'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetDirectHistory", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_metrics_1.ChatMetrics])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map