import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
