import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MetricsController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMetrics } from './chat.metrics';

@Module({
  controllers: [MetricsController],
  providers: [ChatService, ChatGateway, ChatMetrics],
  exports: [ChatService],
})
export class ChatModule {}