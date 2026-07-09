import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/app/certs/server.key'),
    cert: fs.readFileSync('/app/certs/server.crt'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3000, '0.0.0.0');
}
bootstrap();