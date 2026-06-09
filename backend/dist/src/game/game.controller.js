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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GameController = class GameController {
    gameService;
    constructor(gameService) {
        this.gameService = gameService;
    }
    createGame(player1Id) {
        return this.gameService.createGame(player1Id);
    }
    joinGame(gameId, player2Id) {
        return this.gameService.joinGame(gameId, player2Id);
    }
    getHistory(req) {
        console.log('=== [controller] req.user:', req.user);
        return this.gameService.getHistory(req.user.userId);
    }
    getGameState(id) {
        return this.gameService.getGameState(id);
    }
    makeMove(id, playerId, position) {
        return this.gameService.makeMove(id, playerId, position);
    }
    aiMove(id, difficulty) {
        return this.gameService.aiMove(id, difficulty);
    }
    async getPendingGame(req, opponentId) {
        const userId = req.user.userId;
        return this.gameService.getPendingGame(userId, opponentId);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('player1Id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "createGame", null);
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)('gameId')),
    __param(1, (0, common_1.Body)('player2Id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "joinGame", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('history/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getGameState", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('playerId')),
    __param(2, (0, common_1.Body)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "makeMove", null);
__decorate([
    (0, common_1.Post)(':id/ai-move'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('difficulty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "aiMove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('pending/:opponentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('opponentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPendingGame", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map