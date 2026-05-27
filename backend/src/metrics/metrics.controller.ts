import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
});

@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
