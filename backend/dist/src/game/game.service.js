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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GameService = class GameService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsersByIds(ids) {
        return this.prisma.user.findMany({
            where: { id: { in: ids } },
            select: { id: true, username: true, displayName: true, avatarUrl: true },
        });
    }
    async createGame(player1Id) {
        return this.prisma.match.create({
            data: {
                player1: { connect: { id: player1Id } },
                status: 'waiting',
                board: '_________',
            },
        });
    }
    async joinGame(gameId, player2Id) {
        const game = await this.prisma.match.findUnique({ where: { id: gameId } });
        if (!game)
            throw new common_1.NotFoundException('Partida no encontrada');
        if (game.status !== 'waiting')
            throw new common_1.BadRequestException('La partida ya está en curso o terminada');
        if (game.player1Id === player2Id)
            throw new common_1.BadRequestException('No puedes unirte a tu propia partida');
        return this.prisma.match.update({
            where: { id: gameId },
            data: {
                player2: { connect: { id: player2Id } },
                status: 'playing',
            },
        });
    }
    async getGameState(gameId) {
        const game = await this.prisma.match.findUnique({
            where: { id: gameId },
            include: {
                player1: { select: { id: true, username: true, avatarUrl: true } },
                player2: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
        if (!game)
            throw new common_1.NotFoundException('Partida no encontrada');
        return game;
    }
    async makeMove(gameId, playerId, position) {
        const game = await this.prisma.match.findUnique({ where: { id: gameId } });
        if (!game)
            throw new common_1.NotFoundException('Partida no encontrada');
        if (game.status !== 'playing')
            throw new common_1.BadRequestException('La partida no está en curso');
        if (position < 0 || position > 8)
            throw new common_1.BadRequestException('Posición inválida (0-8)');
        const board = game.board.split('');
        const xCount = board.filter(c => c === 'X').length;
        const oCount = board.filter(c => c === 'O').length;
        const isP1Turn = xCount === oCount;
        if (isP1Turn && playerId !== game.player1Id)
            throw new common_1.BadRequestException('No es tu turno (turno de X)');
        if (!isP1Turn && playerId !== game.player2Id)
            throw new common_1.BadRequestException('No es tu turno (turno de O)');
        if (board[position] !== '_')
            throw new common_1.BadRequestException('Posición ya ocupada');
        board[position] = isP1Turn ? 'X' : 'O';
        const newBoard = board.join('');
        this.printBoard(newBoard);
        const hasWinner = this.checkWinner(newBoard);
        const isDraw = !hasWinner && !newBoard.includes('_');
        const winnerVal = hasWinner ? (isP1Turn ? 'player1' : 'player2') : isDraw ? 'draw' : null;
        const isFinished = hasWinner || isDraw;
        const updatedGame = await this.prisma.match.update({
            where: { id: gameId },
            data: {
                board: newBoard,
                winner: winnerVal,
                status: isFinished ? 'finished' : 'playing',
                finishedAt: isFinished ? new Date() : null,
                score1: (hasWinner && isP1Turn) ? { increment: 1 } : undefined,
                score2: (hasWinner && !isP1Turn) ? { increment: 1 } : undefined,
            },
        });
        if (hasWinner) {
            const winnerId = isP1Turn
                ? (updatedGame.player1Id ?? undefined)
                : (updatedGame.player2Id ?? undefined);
            if (winnerId) {
                const player1User = await this.prisma.user.findUnique({
                    where: { id: updatedGame.player1Id },
                    select: { username: true },
                });
                const player2User = updatedGame.player2Id ? await this.prisma.user.findUnique({
                    where: { id: updatedGame.player2Id },
                    select: { username: true },
                }) : null;
                const isVsAI = player1User?.username === 'Guest' || player2User?.username === 'Guest';
                if (!isVsAI) {
                    await this.prisma.user.update({
                        where: { id: winnerId },
                        data: { wins: { increment: 1 } },
                    });
                }
            }
        }
        return updatedGame;
    }
    async getHistory(userId) {
        console.log('=== [getHistory] userId:', userId);
        const matches = await this.prisma.match.findMany({
            where: {
                status: 'finished',
                OR: [{ player1Id: userId }, { player2Id: userId }],
            },
            include: {
                player1: { select: { id: true, username: true, displayName: true } },
                player2: { select: { id: true, username: true, displayName: true } },
            },
            orderBy: { finishedAt: 'desc' },
            take: 50,
        });
        console.log('=== [getHistory] matches found:', matches.length);
        console.log('=== [getHistory] matches:', JSON.stringify(matches));
        const result = matches.map((m) => {
            const isPlayer1 = m.player1Id === userId;
            const opponent = isPlayer1 ? m.player2 : m.player1;
            let result;
            if (m.winner === 'draw')
                result = 'draw';
            else if (m.winner === (isPlayer1 ? 'player1' : 'player2'))
                result = 'win';
            else
                result = 'loss';
            return {
                id: m.id,
                isVsAI: m.isVsAI,
                player1: m.player1,
                player2: m.player2,
                winner: m.winner,
                board: m.board,
                score1: m.score1,
                score2: m.score2,
                playedAt: m.playedAt,
                finishedAt: m.finishedAt,
                result,
                opponentName: opponent?.displayName ?? opponent?.username ?? (m.isVsAI ? 'IA' : '—'),
                playerMark: isPlayer1 ? 'X' : 'O',
            };
        });
        console.log('=== [getHistory] returning:', result.length, 'items');
        return result;
    }
    checkWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        return lines.some(([a, b, c]) => board[a] !== '_' && board[a] === board[b] && board[b] === board[c]);
    }
    printBoard(board) {
        const b = board.split('').map(c => (c === '_' ? '·' : c));
        console.log('\n+---+---+---+');
        console.log(`| ${b[0]} | ${b[1]} | ${b[2]} |`);
        console.log('+---+---+---+');
        console.log(`| ${b[3]} | ${b[4]} | ${b[5]} |`);
        console.log('+---+---+---+');
        console.log(`| ${b[6]} | ${b[7]} | ${b[8]} |`);
        console.log('+---+---+---+\n');
    }
    async aiMove(gameId, difficulty) {
        const game = await this.prisma.match.findUnique({ where: { id: gameId } });
        if (!game)
            throw new common_1.NotFoundException('Partida no encontrada');
        if (game.status !== 'playing')
            throw new common_1.BadRequestException('La partida no está en curso');
        const board = game.board.split('');
        let position;
        if (difficulty === 'easy') {
            position = this.randomMove(board);
        }
        else if (difficulty === 'medium') {
            position = Math.random() < 0.3
                ? this.randomMove(board)
                : this.bestMove(board, 'O');
        }
        else {
            position = this.bestMove(board, 'O');
        }
        return this.makeMove(gameId, game.player2Id, position);
    }
    randomMove(board) {
        const empty = board.map((c, i) => c === '_' ? i : -1).filter(i => i !== -1);
        return empty[Math.floor(Math.random() * empty.length)];
    }
    bestMove(board, aiMark) {
        const humanMark = aiMark === 'O' ? 'X' : 'O';
        let bestScore = -Infinity;
        let bestPos = -1;
        board.forEach((cell, i) => {
            if (cell !== '_')
                return;
            board[i] = aiMark;
            const score = this.minimax(board, 0, false, aiMark, humanMark);
            board[i] = '_';
            if (score > bestScore) {
                bestScore = score;
                bestPos = i;
            }
        });
        return bestPos;
    }
    minimax(board, depth, isMaximizing, aiMark, humanMark) {
        const boardStr = board.join('');
        if (this.checkWinnerForMark(boardStr, aiMark))
            return 10 - depth;
        if (this.checkWinnerForMark(boardStr, humanMark))
            return depth - 10;
        if (!boardStr.includes('_'))
            return 0;
        if (isMaximizing) {
            let best = -Infinity;
            board.forEach((cell, i) => {
                if (cell !== '_')
                    return;
                board[i] = aiMark;
                best = Math.max(best, this.minimax(board, depth + 1, false, aiMark, humanMark));
                board[i] = '_';
            });
            return best;
        }
        else {
            let best = Infinity;
            board.forEach((cell, i) => {
                if (cell !== '_')
                    return;
                board[i] = humanMark;
                best = Math.min(best, this.minimax(board, depth + 1, true, aiMark, humanMark));
                board[i] = '_';
            });
            return best;
        }
    }
    checkWinnerForMark(board, mark) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        return lines.some(([a, b, c]) => board[a] === mark && board[b] === mark && board[c] === mark);
    }
    async getPendingGame(userId, opponentId) {
        const FIVE_MINUTES = 5 * 60 * 1000;
        const now = new Date();
        const match = await this.prisma.match.findFirst({
            where: {
                status: 'playing',
                OR: [
                    { player1Id: userId, player2Id: opponentId },
                    { player1Id: opponentId, player2Id: userId },
                ],
            },
            orderBy: { playedAt: 'desc' },
        });
        if (!match)
            return null;
        const playedAt = match.playedAt || match.playedAt || match.finishedAt || now;
        if (now.getTime() - new Date(playedAt).getTime() > FIVE_MINUTES)
            return null;
        return {
            gameId: match.id,
            roomId: `game_${match.id}`,
            player1Id: match.player1Id,
            player2Id: match.player2Id,
            status: match.status,
        };
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameService);
//# sourceMappingURL=game.service.js.map