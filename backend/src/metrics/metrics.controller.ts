/* import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { register } from './metrics.registry';

@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
} */

import { Controller, Get } from '@nestjs/common';
import { register } from './metrics.registry';

@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics() {
    return register.metrics();
  }
}