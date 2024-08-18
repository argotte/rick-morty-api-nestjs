/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(page = 1): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    data: Character[];
  }> {
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    const characters = await this.prisma.character.findMany({
      skip,
      take: pageSize,
    });

    const totalCharacters = await this.prisma.character.count();
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    const nextPageUrl =
      page < totalPages ? `/tasks?page=${nextPageNumber}` : null;

    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      data: characters,
    };
  }

  async getTaskById(id: number): Promise<Character> {
    return this.prisma.character.findUnique({ where: { id } });
  }

  async getCharactersBySpecies(
    speciesId: number,
    page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    data: Character[];
  }> {
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    const characters = await this.prisma.character.findMany({
      where: { speciesId: speciesId },
      skip,
      take: pageSize,
    });
    const totalCharacters = await this.prisma.character.count({
      where: { speciesId },
    });
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    const nextPageUrl =
      page < totalPages
        ? `/tasks/species/${speciesId}?page=${nextPageNumber}`
        : null;
    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      data: characters,
    };
  }

  async getCharactersByStatus(
    statusId: number,
    page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    data: Character[];
  }> {
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    const characters = await this.prisma.character.findMany({
      where: { statusId: statusId },
      skip,
      take: pageSize,
    });
    const totalCharacters = await this.prisma.character.count({
      where: { statusId },
    });
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    const nextPageUrl =
      page < totalPages
        ? `/tasks/status/${statusId}?page=${nextPageNumber}`
        : null;
    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      data: characters,
    };
  }

  async updateTask(id: number, data: Character): Promise<Character> {
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!existingCharacter) {
      throw new BadRequestException('Character not found');
    }

    const dto: Character = {
      id: data.id,
      name: data.name ?? existingCharacter.name,
      statusId: data.statusId ?? existingCharacter.statusId,
      speciesId: data.speciesId ?? existingCharacter.speciesId,
    };

    if (data.speciesId !== existingCharacter.speciesId) {
      const speciesExist = await this.prisma.subcategory.findUnique({
        where: {
          categoryId: 1, //always 1 for species
          id: data.speciesId,
        }, // speciesId
      });
      if (!speciesExist) {
        throw new BadRequestException('That kind of species does not exist');
      }
    }
    if (data.statusId !== existingCharacter.statusId) {
      const statusExist = await this.prisma.status.findUnique({
        where: {
          statusTypeId: 1, //always 1 for characters
          id: data.statusId,
        }, // statusId
      });
      if (!statusExist) {
        //if status does not exist, it means its not 1 or 2
        throw new BadRequestException('That kind of status does not exist');
      }
    }

    return this.prisma.character.update({ where: { id }, data: dto });
  }

  async deleteTask(id: number): Promise<Character> {
    return this.prisma.character.delete({ where: { id } });
  }
}
