/* eslint-disable prettier/prettier */
// import { Get, Query } from '@nestjs/common';
// import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EpisodeDto } from './EpisodeDto/episode.dto';
@ApiTags('Episodes')
@Controller('episode')
export class EpisodeController {
  constructor(private episodeService: EpisodeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all episodes' })
  @ApiQuery({ name: 'page', required: false })
  async getAllEpisodes(@Query('page') page: number = 1): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: EpisodeDto[];
  }> {
    return this.episodeService.getAllEpisodes(page);
  }

  @Get('season/:seasonNumber')
  @ApiOperation({ summary: 'Get all episodes by Season Number' })
  @ApiQuery({ name: 'page', required: false })
  async getEpisodesBySeason(
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: EpisodeDto[];
  }> {
    return this.episodeService.getEpisodesBySeasonNumber(seasonNumber,page);
  }
}
