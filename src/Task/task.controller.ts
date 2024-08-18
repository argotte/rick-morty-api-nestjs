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

@Controller('character')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getAllTasks(@Query('page') page: number = 1): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: Character[];
  }> {
    return this.taskService.getAllTasks(page);
  }

  @Get(':id')
  async getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Character> {
    return this.taskService.getTaskById(id);
  }

  @Get('species/:speciesId')
  async getCharactersBySpecies(
    @Param('speciesId', ParseIntPipe) speciesId: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: Character[];
  }> {
    return this.taskService.getCharactersBySpecies(speciesId, page);
  }

  @Get('status/:statusId')
  async getCharactersByStatus(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Query('page') page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: Character[];
  }> {
    return this.taskService.getCharactersByStatus(statusId, page);
  }

  @Put(':id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Character,
  ): Promise<Character> {
    return this.taskService.updateTask(id, data);
  }

  @Put('suspend/:id')
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<Character> {
    if (id === undefined) {
      throw new Error('ID is required');
    }
    if (typeof id !== 'number') {
      throw new Error('ID must be a number');
    }
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    return this.taskService.deleteTask(id);
  }
}
