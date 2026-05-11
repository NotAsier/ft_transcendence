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

/**
 * ChatGateway handles channel messages and direct messages.
 *
 * NOTE ON DUAL-GATEWAY ARCHITECTURE
 * ----------------------------------
 * NestJS merges multiple @WebSocketGateway decorators (with the same port /
 * no port) onto the same underlying socket.io Server instance.  This means
 * both this gateway and GameGateway share clients — there is only ONE
 * 'handleConnection' lifecycle that fires per socket across both gateways.
 *
 * To avoid conflicts:
 *   - GameGateway does JWT auth in handleConnection (via handshake.auth.token).
 *   - ChatGateway registers userId via the 'register' event (legacy approach).
 *
 * Clients that supply a JWT token in the handshake will have client.data.userId
 * set by GameGateway automatically.  Clients that don't supply a token must
 * emit 'register' after connecting.
 */
@WebSocketGateway({
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    /** userId → socketId  (for direct-message routing) */
    private userSockets = new Map<number, string>();

    constructor(private chatService: ChatService) {}

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    handleConnection(client: Socket) {
        console.log(`[Chat] Cliente conectado: ${client.id}`);
        // JWT-authenticated clients already have client.data.userId set by
        // GameGateway.handleConnection.  We add them to our map here as well.
        if (client.data.userId) {
            this.userSockets.set(client.data.userId as number, client.id);
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
        console.log(`[Chat] Cliente desconectado: ${client.id}`);
    }

    // ── Registration (for clients without JWT in handshake) ───────────────────

    /**
     * Clients emit 'register' right after connecting to associate their
     * userId with their socket.  This is redundant for JWT-authenticated
     * clients but harmless.
     */
    @SubscribeMessage('register')
    handleRegister(
        @MessageBody() data: { userId: number },
        @ConnectedSocket() client: Socket,
    ) {
        this.userSockets.set(data.userId, client.id);
        // Also make sure client.data.userId is set so game moves work
        if (!client.data.userId) {
            client.data.userId = data.userId;
        }
        console.log(`[Chat] Usuario ${data.userId} registrado (${client.id})`);
    }

    // ── Channel messages ───────────────────────────────────────────────────────

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { content: string; channelId: number; authorId: number },
        @ConnectedSocket() _client: Socket,
    ) {
        const message = await this.chatService.saveMessage(
            data.content,
            data.authorId,
            data.channelId,
        );

        this.server.emit('newMessage', {
            content:   message.content,
            channelId: message.channelId,
            authorId:  message.authorId,
            sentAt:    message.sentAt,
        });
    }

    @SubscribeMessage('getMessages')
    async handleGetMessages(
        @MessageBody() data: { channelId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const messages = await this.chatService.getMessages(data.channelId);
        client.emit('messageHistory', messages);
    }

    // ── Direct messages ────────────────────────────────────────────────────────

    /**
     * BUG FIX: original code passed `data.fromUserId` twice to saveDirectMessage
     * (as both the author and the first userId param).  The correct call passes
     * the content, authorId (= fromUserId), fromUserId, and toUserId.
     */
    @SubscribeMessage('directMessage')
    async handleDirectMessagePersisted(
        @MessageBody() data: { fromUserId: number; toUserId: number; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        // Save to DB — authorId = fromUserId
        const saved = await this.chatService.saveDirectMessage(
            data.content,
            data.fromUserId,   // authorId  ← was incorrectly data.fromUserId twice
            data.fromUserId,   // fromUserId
            data.toUserId,
        );

        console.log(`[Chat] DM ${data.fromUserId}→${data.toUserId}: ${data.content}`);

        const payload = {
            fromUserId: data.fromUserId,
            toUserId:   data.toUserId,
            content:    data.content,
            sentAt:     saved.sentAt.toISOString(),
        };

        const toSocketId = this.userSockets.get(data.toUserId);
        if (toSocketId) {
            this.server.to(toSocketId).emit('directMessage', payload);
        }
        // Echo back to sender
        client.emit('directMessage', payload);
    }

    @SubscribeMessage('getDirectHistory')
    async handleGetDirectHistory(
        @MessageBody() data: { userId1: number; userId2: number },
        @ConnectedSocket() client: Socket,
    ) {
        const history = await this.chatService.getDirectMessages(data.userId1, data.userId2);
        client.emit('directHistory', history);
    }
}