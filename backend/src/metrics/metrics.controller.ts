import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from './metrics.registry';

@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}