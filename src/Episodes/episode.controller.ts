/* eslint-disable prettier/prettier */
// import { Get, Query } from '@nestjs/common';
// import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EpisodeDto } from './EpisodeDto/episode.dto';
import { Episode } from '@prisma/client';
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
    return this.episodeService.getEpisodesBySeasonNumber(seasonNumber, page);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an episode by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'episode ID' })
  @ApiBody({
    schema: {
      example: {
        name: 'Pilot',
        airDate: '2013-12-02 04:30:00.000',
        episodeCode: 'S01E01',
        duration: 23,
        statusId: 4,
        seasonId: 11,
      },
    },
  })
  async updateEpisode(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Episode,
  ): Promise<EpisodeDto> {
    return this.episodeService.updateEpisode(id, data);
  }

  @Put('cancel/:id')
  @ApiOperation({ summary: 'Cancel an episode by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'episode ID' })
  async cancelEpisode(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.episodeService.cancelEpisode(id);
  }

  @Put('activate/:id')
  @ApiOperation({ summary: 'Activate an episode by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'episode ID' })
  async activateEpisode(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.episodeService.reactiveEpisode(id);
  }
}
