/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CharacterEpisodeController } from './characterepisode.controller';
import { CharacterEpisodeService } from './characterepisode.service';
import { TaskService } from 'src/Task/task.service';
import { EpisodeService } from 'src/Episodes/episode.service';

@Module({
  imports: [PrismaModule],
  controllers: [CharacterEpisodeController],
  providers: [CharacterEpisodeService, EpisodeService, TaskService],
})
export class CharacterEpisodeModule {}
