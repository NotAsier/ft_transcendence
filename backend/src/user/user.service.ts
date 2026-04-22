import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: number) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      country: true,
      gender: true,
      birthDate: true,
      wins: true,
      createdAt: true,
    },
  });
}
  async getAll() {
    return this.prisma.user.findMany({
    select: { id: true, username: true },
    });
  }
}