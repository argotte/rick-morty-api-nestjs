/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TaskModule } from './Task/task.module';
import { EpisodeModule } from './Episodes/episode.module';

@Module({
  imports: [TaskModule,EpisodeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
