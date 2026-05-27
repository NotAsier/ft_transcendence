import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { APP_INTERCEPTOR } from '@nestjs/core';


@Module({
  imports: [PrismaModule, AuthModule, UserModule, GameModule, ChatModule, HealthModule],
  controllers: [MetricsController],
})
export class AppModule {}