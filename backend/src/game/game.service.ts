import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
    constructor(private readonly prisma: PrismaService) {}

    // ── Match lifecycle ────────────────────────────────────────────────────────

    async createGame(player1Id: number) {
        return this.prisma.match.create({
            data: {
                player1: { connect: { id: player1Id } },
                status:  'waiting',
                board:   '_________',
            },
        });
    }

    async joinGame(gameId: number, player2Id: number) {
        const game = await this.prisma.match.findUnique({ where: { id: gameId } });

        if (!game)                          throw new NotFoundException('Partida no encontrada');
        if (game.status !== 'waiting')      throw new BadRequestException('La partida ya está en curso o terminada');
        if (game.player1Id === player2Id)   throw new BadRequestException('No puedes unirte a tu propia partida');

        return this.prisma.match.update({
            where: { id: gameId },
            data: {
                player2: { connect: { id: player2Id } },
                status:  'playing',
            },
        });
    }

    async getGameState(gameId: number) {
        const game = await this.prisma.match.findUnique({
            where:   { id: gameId },
            include: {
                player1: { select: { id: true, username: true, avatarUrl: true } },
                player2: { select: { id: true, username: true, avatarUrl: true } },
            },
        });

        if (!game) throw new NotFoundException('Partida no encontrada');
        return game;
    }

    // ── Move logic ─────────────────────────────────────────────────────────────

    async makeMove(gameId: number, playerId: number, position: number) {
        const game = await this.prisma.match.findUnique({ where: { id: gameId } });

        if (!game)                              throw new NotFoundException('Partida no encontrada');
        if (game.status !== 'playing')          throw new BadRequestException('La partida no está en curso');
        if (position < 0 || position > 8)       throw new BadRequestException('Posición inválida (0-8)');

        const board    = game.board.split('');
        const xCount   = board.filter(c => c === 'X').length;
        const oCount   = board.filter(c => c === 'O').length;
        const isP1Turn = xCount === oCount; // X always starts; ties mean X's turn

        // Enforce turn order
        if (isP1Turn  && playerId !== game.player1Id) throw new BadRequestException('No es tu turno (turno de X)');
        if (!isP1Turn && playerId !== game.player2Id) throw new BadRequestException('No es tu turno (turno de O)');

        // Enforce empty cell
        if (board[position] !== '_') throw new BadRequestException('Posición ya ocupada');

        // Apply move
        board[position] = isP1Turn ? 'X' : 'O';
        const newBoard  = board.join('');

        this.printBoard(newBoard);

        const hasWinner = this.checkWinner(newBoard);
        const isDraw    = !hasWinner && !newBoard.includes('_');
        const winnerVal = hasWinner ? (isP1Turn ? 'player1' : 'player2') : isDraw ? 'draw' : null;
        const isFinished = hasWinner || isDraw;

        const updatedGame = await this.prisma.match.update({
            where: { id: gameId },
            data: {
                board:      newBoard,
                winner:     winnerVal,
                status:     isFinished ? 'finished' : 'playing',
                finishedAt: isFinished ? new Date() : null,
                // Increment per-match score counters
                score1: (hasWinner && isP1Turn)  ? { increment: 1 } : undefined,
                score2: (hasWinner && !isP1Turn) ? { increment: 1 } : undefined,
            },
        });

        // Update winner's global win counter
        if (hasWinner) {
            const winnerId = isP1Turn
                ? (updatedGame.player1Id ?? undefined)
                : (updatedGame.player2Id ?? undefined);

            if (winnerId) {
                await this.prisma.user.update({
                    where: { id: winnerId },
                    data:  { wins: { increment: 1 } },
                });
            }
        }

        return updatedGame;
    }

    // ── Internal helpers ───────────────────────────────────────────────────────

    private checkWinner(board: string): boolean {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6],             // diagonals
        ];
        return lines.some(([a, b, c]) =>
            board[a] !== '_' && board[a] === board[b] && board[b] === board[c],
        );
    }

    private printBoard(board: string): void {
        const b = board.split('').map(c => (c === '_' ? '·' : c));
        console.log('\n+---+---+---+');
        console.log(`| ${b[0]} | ${b[1]} | ${b[2]} |`);
        console.log('+---+---+---+');
        console.log(`| ${b[3]} | ${b[4]} | ${b[5]} |`);
        console.log('+---+---+---+');
        console.log(`| ${b[6]} | ${b[7]} | ${b[8]} |`);
        console.log('+---+---+---+\n');
    }
}