import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserMetrics } from '../user/user.metrics';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userMetrcs: UserMetrics,
  ) {}

  async register(
    email: string,
    password: string,
    username: string,
    birthDate?: string,
    country?: string,
    gender?: string,
  ) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestException('El email no tiene un formato válido');


    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new ConflictException('Email ya registrado');

    const usernameExists = await this.prisma.user.findUnique({ where: { username } });
    if (usernameExists) throw new ConflictException('Username ya en uso');

    if (birthDate) {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) throw new BadRequestException('Fecha de nacimiento inválida');
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 120);
      if (minAge > date) throw new BadRequestException('mu viejo');
      const today = new Date();
      if (date > today) throw new BadRequestException('futurama');
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

  private validateGmailDomain(email: string): void {
  if (!email.endsWith('@gmail.com')) {
    throw new BadRequestException('Solo se permiten emails con dominio @gmail.com');
  }
}

  async login(email: string, password: string) {

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestException('El email no tiene un formato válido');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    if (!user.password) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    this.userMetrcs.incLogin();
    this.userMetrcs.incOnline();

    return this.signToken(user.id, user.email);
 
  }

  async findOrCreateGoogleUser(profile: {
    googleId:    string;
    email:       string | null;
    displayName: string | null;
    avatarUrl:   string | null;
  }) {
    // 1. ¿Ya existe por oauthId?
    let user = await this.prisma.user.findUnique({
      where: { oauthId: profile.googleId },
    });
    if (user) return this.signToken(user.id, user.email);

    // 2. ¿Existe ya una cuenta con ese email? → vincularla
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

    // 3. Usuario completamente nuevo
    const base     = (profile.email?.split('@')[0] ?? 'user').replace(/[^a-z0-9]/gi, '');
    let username   = base;
    let suffix     = 1;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${suffix++}`;
    }

    user = await this.prisma.user.create({
      data: {
        email:         profile.email ?? `google_${profile.googleId}@noemail.local`,
        username,
        displayName:   profile.displayName,
        avatarUrl:     profile.avatarUrl,
        oauthId:       profile.googleId,
        oauthProvider: 'google',
        password:      null,
      },
    });

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: number, email: string | null) {
    const payload = { sub: userId, email: email ?? '' };
    return { access_token: this.jwtService.sign(payload) };
  }
}