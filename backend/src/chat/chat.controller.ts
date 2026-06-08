import { Controller, Get, Res } from '@nestjs/common';
import { ChatMetrics } from './chat.metrics';

@Controller('api/metrics')
export class MetricsController {
  constructor(private readonly chatMetrics: ChatMetrics) {}

  @Get()
  async metrics(@Res() res: any) {
    res.set('Content-Type', 'text/plain');
    res.end(await this.chatMetrics.getMetrics());
  }
}