/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<Character[]> {
    return this.prisma.character.findMany();
  }

  async getTaskById(id: number): Promise<Character> {
    return this.prisma.character.findUnique({ where: { id } });
  }

  async createTask(data: Character): Promise<Character> {
    return this.prisma.character.create({ data });
  }

  async updateTask(id: number, data: Character): Promise<Character> {
    return this.prisma.character.update({ where: { id }, data });
  }

  async deleteTask(id: number): Promise<Character> {
    return this.prisma.character.delete({ where: { id } });
  }
}
