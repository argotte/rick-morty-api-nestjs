/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';

@Module({
  imports: [PrismaModule],
  controllers: [EpisodeController],
  providers: [EpisodeService],
})
export class EpisodeModule {}
