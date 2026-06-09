import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    saveMessage(content: string, authorId: number, channelId: number): Promise<{
        id: number;
        content: string;
        sentAt: Date;
        authorId: number;
        channelId: number;
    }>;
    getMessages(channelId: number): Promise<({
        author: {
            id: number;
            username: string;
        };
    } & {
        id: number;
        content: string;
        sentAt: Date;
        authorId: number;
        channelId: number;
    })[]>;
    getOrCreateDMChannel(userId1: number, userId2: number): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        isPrivate: boolean;
    }>;
    getDirectMessages(userId1: number, userId2: number): Promise<({
        author: {
            id: number;
            username: string;
        };
    } & {
        id: number;
        content: string;
        sentAt: Date;
        authorId: number;
        channelId: number;
    })[]>;
    saveDirectMessage(content: string, authorId: number, userId1: number, userId2: number): Promise<{
        id: number;
        content: string;
        sentAt: Date;
        authorId: number;
        channelId: number;
    }>;
}
