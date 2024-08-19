/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TaskModule } from './Task/task.module';
import { EpisodeModule } from './Episodes/episode.module';
import { CharacterEpisodeModule } from './CharacterEpisodes/characterepisode.module';

@Module({
  imports: [TaskModule,EpisodeModule,CharacterEpisodeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
