import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';

import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';

//import { LoggerService } from './logger/logger.service';
//import { UserActivityInterceptor } from './logger/user-activity.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    GameModule,
    ChatModule,
    HealthModule,
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    // LoggerService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: UserActivityInterceptor,
    // },
  ],
})
export class AppModule {}