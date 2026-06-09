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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                country: true,
                gender: true,
                birthDate: true,
                wins: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
    }
    async updateMe(userId, data) {
        const allowed = {
            displayName: data.displayName,
            country: data.country,
            gender: data.gender,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            avatarUrl: data.avatarUrl,
        };
        Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);
        return this.prisma.user.update({
            where: { id: userId },
            data: allowed,
        });
    }
    async getAll() {
        return this.prisma.user.findMany({
            where: {
                username: { not: 'Guest' },
            },
            select: { id: true, username: true },
        });
    }
    async sendFriendRequest(fromUserId, toUserId) {
        if (fromUserId === toUserId)
            throw new common_1.BadRequestException('No puedes añadirte a ti mismo');
        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { fromUserId, toUserId },
                    { fromUserId: toUserId, toUserId: fromUserId },
                ],
            },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya existe una relación entre estos usuarios');
        return this.prisma.friendship.create({
            data: { fromUserId, toUserId, accepted: false },
        });
    }
    async acceptFriendRequest(userId, fromUserId) {
        const friendship = await this.prisma.friendship.findFirst({
            where: { fromUserId, toUserId: userId, accepted: false },
        });
        if (!friendship)
            throw new common_1.BadRequestException('Petición no encontrada');
        return this.prisma.friendship.update({
            where: { id: friendship.id },
            data: { accepted: true },
        });
    }
    async removeFriend(userId, otherUserId) {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { fromUserId: userId, toUserId: otherUserId },
                    { fromUserId: otherUserId, toUserId: userId },
                ],
            },
        });
        if (!friendship)
            throw new common_1.BadRequestException('Relación no encontrada');
        return this.prisma.friendship.delete({ where: { id: friendship.id } });
    }
    async getPendingRequests(userId) {
        return this.prisma.friendship.findMany({
            where: { toUserId: userId, accepted: false },
            include: { fromUser: { select: { id: true, username: true } } },
        });
    }
    async getUser(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, displayName: true, country: true, gender: true, birthDate: true, wins: true, createdAt: true },
        });
    }
    async getFriends(userId) {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                OR: [
                    { fromUserId: userId, accepted: true },
                    { toUserId: userId, accepted: true },
                ],
            },
            include: {
                fromUser: { select: { id: true, username: true } },
                toUser: { select: { id: true, username: true } },
            },
        });
        return friendships.map(f => f.fromUserId === userId ? f.toUser : f.fromUser);
    }
    async getGuest() {
        return this.prisma.user.findUnique({
            where: { username: 'Guest' },
            select: { id: true, username: true },
        });
    }
    async getLeaderboard() {
        return this.prisma.user.findMany({
            where: { username: { not: 'Guest' } },
            select: { id: true, username: true, displayName: true, wins: true, country: true },
            orderBy: { wins: 'desc' },
            take: 10,
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map