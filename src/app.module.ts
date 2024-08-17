/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TaskModule } from './Task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
