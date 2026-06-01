import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor() {
    collectDefaultMetrics();
  }
}