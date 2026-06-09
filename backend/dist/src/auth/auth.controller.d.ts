import { AuthService } from './auth.service';
declare class RegisterDto {
    email: string;
    password: string;
    username: string;
    birthDate?: string;
    country?: string;
    gender?: string;
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    googleLogin(): void;
    googleCallback(req: any, res: any): void;
    me(req: any): any;
}
export {};
