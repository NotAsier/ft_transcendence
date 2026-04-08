import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, username: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hash, username },
    });

    return this.signToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    if (!user.password) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: number, email: string | null) {
    const payload = { sub: userId, email: email ?? '' };
    return { access_token: this.jwtService.sign(payload) };
  }
}