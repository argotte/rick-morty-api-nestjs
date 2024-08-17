/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { Character } from '@prisma/client';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getAllTasks() {
    return this.taskService.getAllTasks();
  }

  @Get(':id')
  async getTaskById(@Param('id') id: number) {
    return this.taskService.getTaskById(id);
  }

  @Post()
  async createTask(@Body() data: Character) {
    return this.taskService.createTask(data);
  }

  @Put(':id')
  async updateTask(@Param('id') id: number, @Body() data: Character) {
    return this.taskService.updateTask(id, data);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: number) {
    if (id === undefined) {
      throw new Error('ID is required');
    }
    if (typeof id !== 'number') {
      throw new Error('ID must be a number');
    }
    if (id <= 0) {
      throw new Error('ID must be a positive number');
    }
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return this.taskService.deleteTask(id);
  }
}
