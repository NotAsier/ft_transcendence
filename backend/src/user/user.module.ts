import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserMetrics } from './user.metrics';

@Module({
  providers: [UserService, PrismaService, UserMetrics],
  controllers: [UserController],
  exports: [UserMetrics],
})
export class UserModule {}