import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(content: string, authorId: number, channelId: number) {
    return this.prisma.message.create({
      data: {
        content,
        authorId,
        channelId,
      },
    });
  }

  async getMessages(channelId: number) {
    return this.prisma.message.findMany({
      where: { channelId },
      orderBy: { sentAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }
}