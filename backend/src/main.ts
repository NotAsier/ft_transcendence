import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('BOOTSTRAP START');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');  
  console.log('APP CREATED');
  await app.listen(3000, '0.0.0.0'); 
  console.log('LISTENING 3000');
}
bootstrap();