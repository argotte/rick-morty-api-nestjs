/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CharacterEpisodeDto } from "./CharacterEpisodeDto/characterepisode.dto";
import { CharacterEpisodeService } from "./characterepisode.service";
import { CreateCharacterEpisodeDto } from "./CharacterEpisodeDto/createCharacterEpisode.dto";

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

  @Get(':id')
  @ApiOperation({ summary: 'Get character-episode-relation by ID' })
  async getCharacterEpisodeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CharacterEpisodeDto> {
    return this.characterEpisodeService.getCharacterEpisodeById(id);
  }
  
  @Post()
  @ApiOperation({ summary: 'Create a new character-episode relation' })
  @ApiBody({ type: CreateCharacterEpisodeDto })
  async createCharacterEpisode(
    @Body() characterEpisodeDto: CreateCharacterEpisodeDto,
  ): Promise<CharacterEpisodeDto> {
    return this.characterEpisodeService.createCharacterEpisode(
      characterEpisodeDto,
    );
  }
}
