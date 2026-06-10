"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const user_metrics_1 = require("../user/user.metrics");
let AuthService = class AuthService {
    prisma;
    jwtService;
    userMetrcs;
    constructor(prisma, jwtService, userMetrcs) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.userMetrcs = userMetrcs;
    }
    async register(email, password, username, birthDate, country, gender) {
        const emailExists = await this.prisma.user.findUnique({ where: { email } });
        if (emailExists)
            throw new common_1.ConflictException('Email ya registrado');
        const usernameExists = await this.prisma.user.findUnique({ where: { username } });
        if (usernameExists)
            throw new common_1.ConflictException('Username ya en uso');
        if (birthDate) {
            const date = new Date(birthDate);
            if (isNaN(date.getTime()))
                throw new common_1.BadRequestException('Fecha de nacimiento inválida');
            const minAge = new Date();
            minAge.setFullYear(minAge.getFullYear() - 120);
            if (minAge > date)
                throw new common_1.BadRequestException('mu viejo');
            const today = new Date();
            if (date > today)
                throw new common_1.BadRequestException('futurama');
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hash,
                username,
                birthDate: birthDate ? new Date(birthDate) : null,
                country: country ?? null,
                gender: gender ?? null,
            },
        });
        console.log('REGISTER HIT');
        this.userMetrcs.incCreated();
        return this.signToken(user.id, user.email);
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        if (!user.password)
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        this.userMetrcs.incLogin();
        this.userMetrcs.incOnline();
        return this.signToken(user.id, user.email);
    }
    async findOrCreateGoogleUser(profile) {
        let user = await this.prisma.user.findUnique({
            where: { oauthId: profile.googleId },
        });
        if (user)
            return this.signToken(user.id, user.email);
        if (profile.email) {
            user = await this.prisma.user.findUnique({
                where: { email: profile.email },
            });
            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { oauthId: profile.googleId, oauthProvider: 'google' },
                });
                return this.signToken(user.id, user.email);
            }
        }
        const base = (profile.email?.split('@')[0] ?? 'user').replace(/[^a-z0-9]/gi, '');
        let username = base;
        let suffix = 1;
        while (await this.prisma.user.findUnique({ where: { username } })) {
            username = `${base}${suffix++}`;
        }
        user = await this.prisma.user.create({
            data: {
                email: profile.email ?? `google_${profile.googleId}@noemail.local`,
                username,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                oauthId: profile.googleId,
                oauthProvider: 'google',
                password: null,
            },
        });
        return this.signToken(user.id, user.email);
    }
    signToken(userId, email) {
        const payload = { sub: userId, email: email ?? '' };
        return { access_token: this.jwtService.sign(payload) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        user_metrics_1.UserMetrics])
], AuthService);
//# sourceMappingURL=auth.service.js.map