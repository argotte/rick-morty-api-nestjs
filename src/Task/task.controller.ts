/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { Character } from '@prisma/client';
import { TaskService } from './task.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CharacterDto } from './CharacterDto/character.dto';
@ApiTags('character')
@Controller('character')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Get all characters' })
  @ApiQuery({ name: 'page', required: false })
  async getAllTasks(@Query('page') page: number = 1): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    return this.taskService.getAllTasks(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a character by    ID' })
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CharacterDto> {
    return this.taskService.getTaskById(id);
  }
  @Get('/specie/:id')
  @ApiOperation({ summary: 'Get a species name by    ID' })
  async getSpeciesById(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.taskService.getSpeciesById(id);
  }

  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Get all characters by species' })
  @ApiQuery({ name: 'page', required: false })
  async getCharactersBySpecies(
    @Param('speciesId', ParseIntPipe) speciesId: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    return this.taskService.getCharactersBySpecies(speciesId, page);
  }

  @Get('status/:statusId')
  @ApiOperation({ summary: 'Get all characters by status' })
  @ApiQuery({ name: 'page', required: false })
  async getCharactersByStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    return this.taskService.getCharactersByStatus(statusId, page);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a character by    ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Character ID' })
  @ApiBody({
    schema: {
      example: {
        name: 'Rick Sanchez',
        statusId: 1,
        speciesId: 1,
      },
    },
  })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Character,
  ): Promise<CharacterDto> {
    return this.taskService.updateTask(id, data);
  }

  @Put('suspend/:id')
  @ApiOperation({ summary: 'Suspend a character by    ID' })
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.taskService.deleteTask(id);
  }

  @Put('revive/:id')
  @ApiOperation({ summary: 'Active a character by    ID' })
  async reviveTask(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.taskService.reviveTask(id);
  }
}
