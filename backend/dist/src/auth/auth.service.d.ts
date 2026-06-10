import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserMetrics } from "../user/user.metrics";
export declare class AuthService {
    private prisma;
    private jwtService;
    private userMetrcs;
    constructor(prisma: PrismaService, jwtService: JwtService, userMetrcs: UserMetrics);
    register(email: string, password: string, username: string, birthDate?: string, country?: string, gender?: string): Promise<{
        access_token: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    findOrCreateGoogleUser(profile: {
        googleId: string;
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
    }): Promise<{
        access_token: string;
    }>;
    private signToken;
}
