/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Seeder } from './prisma/seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = new Seeder();
  await seeder.seed();
  await app.listen(3000);
}
bootstrap();
