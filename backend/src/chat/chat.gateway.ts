import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  import { ChatMetrics } from './chat.metrics';
  import { UserMetrics } from '../user/user.metrics';
  
  @WebSocketGateway({
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private userSockets = new Map<number, string>();
  
    constructor(
      private readonly chatService: ChatService,
      private readonly metrics: ChatMetrics,
      private readonly userMetrics: UserMetrics,
    ) {}
  
    // ─────────────────────────────
    // Connection lifecycle
    // ─────────────────────────────
  
    handleConnection(client: Socket) {
        console.log('[CHAT] connect', client.id);
        const userId = client.data?.userId;
      
        if (userId) {
          this.userSockets.set(userId, client.id);
        }
      }
  
    handleDisconnect(client: Socket) {
      this.metrics.incDisconnects();
  
      for (const [userId, socketId] of this.userSockets.entries()) {
        if (socketId === client.id) {
          this.userSockets.delete(userId);
          this.userMetrics.untrackOnline(userId);
          break;
        }
      }
    }
  
    // ─────────────────────────────
    // Registration
    // ─────────────────────────────
  
    @SubscribeMessage('register')
    handleRegister(
      @MessageBody() data: { userId: number },
      @ConnectedSocket() client: Socket,
    ) {
      this.userSockets.set(data.userId, client.id);
      client.data.userId = data.userId;
  
      this.metrics.incConnections();
    }
  
    // ─────────────────────────────
    // Channel messages
    // ─────────────────────────────
  
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { content: string; channelId: number; authorId: number },
    ) {
      const start = Date.now();
  
      const message = await this.chatService.saveMessage(
        data.content,
        data.authorId,
        data.channelId,
      );
  
      this.server.emit('newMessage', {
        content: message.content,
        channelId: message.channelId,
        authorId: message.authorId,
        sentAt: message.sentAt,
      });
  
      this.metrics.incChannelMessages();
      this.metrics.observeLatency(Date.now() - start);
    }
  
    // ─────────────────────────────
    // Direct messages
    // ─────────────────────────────
  
    @SubscribeMessage('directMessage')
    async handleDirectMessage(
      @MessageBody()
      data: { fromUserId: number; toUserId: number; content: string },
      @ConnectedSocket() client: Socket,
    ) {
      const start = Date.now();
  
      const saved = await this.chatService.saveDirectMessage(
        data.content,
        data.fromUserId,
        data.fromUserId,
        data.toUserId,
      );
  
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
  
    // ─────────────────────────────
    // History (channel)
    // ─────────────────────────────
  
    @SubscribeMessage('getMessages')
    async handleGetMessages(
      @MessageBody() data: { channelId: number },
      @ConnectedSocket() client: Socket,
    ) {
      const messages = await this.chatService.getMessages(data.channelId);
      this.metrics.incHistoryRequests();
      client.emit('messageHistory', messages);
    }
  
    // ─────────────────────────────
    // Direct history
    // ─────────────────────────────
  
    @SubscribeMessage('getDirectHistory')
    async handleGetDirectHistory(
      @MessageBody() data: { userId1: number; userId2: number },
      @ConnectedSocket() client: Socket,
    ) {
      const start = Date.now();
  
      const history = await this.chatService.getDirectMessages(
        data.userId1,
        data.userId2,
      );
  
      this.metrics.incHistoryRequests();
  
      client.emit('directHistory', history);
  
      this.metrics.observeLatency(Date.now() - start);
    }
  }