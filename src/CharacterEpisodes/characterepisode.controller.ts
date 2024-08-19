/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CharacterEpisodeDto } from "./CharacterEpisodeDto/characterepisode.dto";
import { CharacterEpisodeService } from "./characterepisode.service";

@ApiTags('Character-Episodes relation')
@Controller('characterepisode')
export class CharacterEpisodeController {
  constructor(private characterEpisodeService: CharacterEpisodeService) {}

  // @Get()
  // async getCharacterEpisodes(
  //   @Query() query: GetCharacterEpisodesQuery,
  // ): Promise<CharacterEpisode[]> {
  //   return this.characterEpisodeService.getCharacterEpisodes(query);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all episodes' })
  @ApiQuery({ name: 'page', required: false })
  async getAllEpisodes(@Query('page') page: number = 1): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeDto[];
  }> {
    return this.characterEpisodeService.getAllInteractions(page);
  }
}
