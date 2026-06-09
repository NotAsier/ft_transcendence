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
import { JwtService } from '@nestjs/jwt';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SINGLE unified gateway on port 3001 (or the same port as the app if you
 * prefer — just make sure chat.gateway.ts uses the SAME port so Socket.io
 * shares one server).  If you want both gateways on the same default port,
 * remove the `namespace` option and set port: 3000 in both, but keep only
 * ONE handleConnection that does JWT auth (see README note below).
 *
 * Easiest setup: run this gateway on the default port (no port arg) and
 * delete the port from chat.gateway.ts as well — NestJS will merge them
 * onto the same underlying socket.io server automatically.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    /** userId → socketId */
    private connectedUsers = new Map<number, string>();

    constructor(
        private jwtService: JwtService,
        private gameService: GameService,
        private prisma: PrismaService,
    ) {}

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                // Allow connection without token; userId will be set via
                // 'register' event (used by chat). Game moves require userId,
                // so unauthenticated clients simply can't make moves.
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.userId = payload.sub;
            this.connectedUsers.set(payload.sub, client.id);
            console.log(`[Game] Usuario ${payload.sub} conectado (${client.id})`);
            this.server.emit('user_connected', { userId: payload.sub });

            // Send snapshot of currently online users to the newly connected client
            this.sendOnlineUsersSnapshot(client, payload.sub);
        } catch {
            // Bad token — disconnect only if a token was actually supplied.
            if (client.handshake.auth?.token) {
                client.disconnect();
            }
        }
    }

    private async sendOnlineUsersSnapshot(client: Socket, currentUserId: number) {
        const otherOnlineUserIds = Array.from(this.connectedUsers.keys())
            .filter(id => id !== currentUserId);

        if (otherOnlineUserIds.length > 0) {
            const otherOnlineUsers = await this.gameService.getUsersByIds(otherOnlineUserIds);
            client.emit('online_users_snapshot', { users: otherOnlineUsers });
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId as number | undefined;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`[Game] Usuario ${userId} desconectado`);
            this.server.emit('user_disconnected', { userId });
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Called by ChatGateway's 'register' event so that presence tracking works
     * for clients that connect without a token in the handshake (legacy flow).
     */
    registerUser(userId: number, socketId: string) {
        this.connectedUsers.set(userId, socketId);
    }

    unregisterBySocketId(socketId: string) {
        for (const [userId, sid] of this.connectedUsers) {
            if (sid === socketId) {
                this.connectedUsers.delete(userId);
                break;
            }
        }
    }

    // ── Presence ───────────────────────────────────────────────────────────────

    @SubscribeMessage('get_online_friends')
    handleGetOnlineFriends(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { friendIds: number[] },
    ) {
        const onlineIds = data.friendIds.filter(id => this.connectedUsers.has(id));
        client.emit('online_friends', { onlineIds });
    }

    // ── Invitations ────────────────────────────────────────────────────────────

    @SubscribeMessage('send_invitation')
    handleSendInvitation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { toUserId: number; fromUsername: string },
    ) {
        const fromUserId  = client.data.userId as number;
        const toSocketId  = this.connectedUsers.get(data.toUserId);

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

    @SubscribeMessage('accept_invitation')
    async handleAcceptInvitation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { fromUserId: number; fromUsername: string },
    ) {
        const player2Id   = client.data.userId as number;
        const fromSocketId = this.connectedUsers.get(data.fromUserId);

        if (!fromSocketId) {
            client.emit('invitation_error', { message: 'El usuario ya no está conectado' });
            return;
        }

        try {
            // Create the match in the DB with player1 = inviter, player2 = accepter
            const game = await this.gameService.createGame(data.fromUserId);
            await this.gameService.joinGame(game.id, player2Id);

            const roomId = `game_${game.id}`;

            // Both sockets join the room
            client.join(roomId);
            const fromSocket = this.server.sockets.sockets.get(fromSocketId);
            fromSocket?.join(roomId);

            // Fetch usernames so the frontend can display them without a separate HTTP call
            const [p1, p2] = await Promise.all([
                this.prisma.user.findUnique({ where: { id: data.fromUserId }, select: { username: true } }),
                this.prisma.user.findUnique({ where: { id: player2Id },       select: { username: true } }),
            ]);

            // Emit game_start to both players
            this.server.to(roomId).emit('game_start', {
                roomId,
                gameId:          game.id,
                player1Id:       data.fromUserId,   // X
                player2Id,                           // O
                player1Username: p1?.username,
                player2Username: p2?.username,
            });

            console.log(`[Game] Partida ${game.id} iniciada en sala ${roomId}`);
        } catch (e: any) {
            client.emit('invitation_error', { message: e.message });
        }
    }

    @SubscribeMessage('reject_invitation')
    handleRejectInvitation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { fromUserId: number },
    ) {
        const fromSocketId = this.connectedUsers.get(data.fromUserId);
        if (fromSocketId) {
            this.server.to(fromSocketId).emit('invitation_rejected', {
                byUserId: client.data.userId,
            });
        }
    }

    // ── In-game moves ──────────────────────────────────────────────────────────

    /**
     * Event: 'online_move'
     * Payload: { gameId: number; position: number; roomId: string }
     *
     * The frontend (TicTacToe.tsx) emits this event when it's the local
     * player's turn.  The gateway delegates all validation and state mutation
     * to GameService, then broadcasts the new state to the room.
     */
    @SubscribeMessage('online_move')
    async handleOnlineMove(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: number; position: number; roomId: string },
    ) {
        const playerId = client.data.userId as number;

        if (!playerId) {
            client.emit('move_error', { message: 'No autenticado' });
            return;
        }

        try {
            const updatedGame = await this.gameService.makeMove(
                data.gameId,
                playerId,
                data.position,
            );

            // Broadcast new board to both players
            this.server.to(data.roomId).emit('game_updated', {
                board:  updatedGame.board,
                status: updatedGame.status,
                winner: updatedGame.winner,
            });

            // If the game is over, also emit a dedicated event for clarity
            if (updatedGame.status === 'finished') {
                this.server.to(data.roomId).emit('game_over', {
                    winner: updatedGame.winner,   // 'player1' | 'player2' | 'draw'
                    board:  updatedGame.board,
                });
                console.log(`[Game] Partida ${data.gameId} terminada. Ganador: ${updatedGame.winner}`);
            }
        } catch (e: any) {
            client.emit('move_error', { message: e.message });
        }
    }
}