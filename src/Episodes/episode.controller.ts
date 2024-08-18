/* eslint-disable prettier/prettier */
// import { Get, Query } from '@nestjs/common';
// import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';

export class EpisodeController {
  constructor(private episodeService: EpisodeService) {}

//   @Get()
//   @ApiOperation({ summary: 'Get all episodes' })
//   @ApiQuery({ name: 'page', required: false })
//   async getAllEpisodes(@Query('page') page: number = 1): Promise<{
//     totalEpisodes: number;
//     currentPage: number;
//     totalPages: number;
//     nextPageUrl: string | null;
//     prevPageUrl: string | null;
//     data: EpisodeDto[];
//   }> {
//     return this.episodeService.getAllEpisodes(page);
//   }
}
