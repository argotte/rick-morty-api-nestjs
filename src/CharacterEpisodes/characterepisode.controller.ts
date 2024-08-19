/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CharacterEpisodeDto } from './CharacterEpisodeDto/characterepisode.dto';
import { CharacterEpisodeService } from './characterepisode.service';
import { CreateCharacterEpisodeDto } from './CharacterEpisodeDto/createCharacterEpisode.dto';
import { CharacterEpisodeForAllByCharacterStatusIdDto } from './CharacterEpisodeDto/characterepisodeForAllByCharacterStatusId.dto';
import { CharacterEpisodeAllFilterDto } from './CharacterEpisodeDto/characterEpisodeAllFilter.dto';

@ApiTags('Character-Episodes relation')
@Controller('characterepisode')
export class CharacterEpisodeController {
  constructor(private characterEpisodeService: CharacterEpisodeService) {}

  @Get('filters/')
  @ApiOperation({
    summary:
      'Get all character-episode relations filtered by character status, episode status, and season',
  })
  @ApiQuery({ name: 'statusIdCharacter', required: true })
  @ApiQuery({ name: 'statusIdEpisode', required: true })
  @ApiQuery({ name: 'seasonId', required: true })
  @ApiQuery({ name: 'page', required: false })
  async getRelationsByFilters(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('statusIdCharacter', ParseIntPipe)
    statusIdCharacter: number = undefined,
    @Query('statusIdEpisode', ParseIntPipe)
    statusIdEpisode: number = undefined,
    @Query('seasonId', ParseIntPipe)
    seasonId: number = undefined,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeAllFilterDto[];
  }> {
    return this.characterEpisodeService.getRelationsByFilters(
      page,
      statusIdCharacter,
      statusIdEpisode,
      seasonId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all character-episode-relations' })
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

  @Get('One/:id')
  @ApiOperation({ summary: 'Get character-episode-relation by ID' })
  async getCharacterEpisodeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CharacterEpisodeDto> {
    return this.characterEpisodeService.getCharacterEpisodeById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new character-episode-relation' })
  @ApiBody({ type: CreateCharacterEpisodeDto })
  async createCharacterEpisode(
    @Body() characterEpisodeDto: CreateCharacterEpisodeDto,
  ): Promise<CharacterEpisodeDto> {
    return this.characterEpisodeService.createCharacterEpisode(
      characterEpisodeDto,
    );
  }

  @Get('statusCharacter/:statusId')
  @ApiOperation({
    summary: 'Get all character-episode-relation by characters-statusId ',
  })
  @ApiQuery({ name: 'page', required: false })
  async getRelationsByCharacterStatusId(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeForAllByCharacterStatusIdDto[];
  }> {
    return this.characterEpisodeService.getRelationsByCharacterStatusId(
      statusId,
      page,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a character-episode relation by its ID',
  })
  async deleteCharacterEpisode(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const deleted =
      await this.characterEpisodeService.deleteCharacterEpisode(id);
    if (!deleted) {
      throw new NotFoundException(`CharacterEpisodeRelation with ID ${id} not found`);
    }
    return { message: 'CharacterEpisodeRelation deleted successfully' };
  }
}
