import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { startProcessMetrics } from './metrics/metrics.process';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // activa métricas HTTP
  app.useGlobalInterceptors(new HttpMetricsInterceptor());

  // activa métricas de proceso
  startProcessMetrics();

  await app.listen(3000, '0.0.0.0');

  console.log('APP CREATED');
  console.log('LISTENING 3000');
}

bootstrap();