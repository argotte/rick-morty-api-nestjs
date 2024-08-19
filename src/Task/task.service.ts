/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { Character } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacterDto } from './CharacterDto/character.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(page = 1): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    const characterResponse: CharacterDto[] = [];
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    const characters = await this.prisma.character.findMany({
      skip,
      take: pageSize,
    });
    if (!characters) {
      throw new BadRequestException('No characters found');
    }

    for (let i = 0; i < characters.length; i++) {
      const character: CharacterDto = {
        id: characters[i].id,
        name: characters[i].name,
        status: (await this.getStatusById(characters[i].statusId)) ?? undefined,
        species:
          (await this.getSpeciesById(characters[i].speciesId)) ?? undefined,
      };
      characterResponse.push(character);
    }

    const totalCharacters = await this.prisma.character.count();
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages ? `/character?page=${nextPageNumber}` : null;
    const prevPageUrl = page > 1 ? `/character?page=${prevPageNumber}` : null;

    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: characterResponse,
    };
  }

  async getTaskById(id: number): Promise<CharacterDto> {
    const character: Character = await this.prisma.character.findUnique({
      where: { id },
    });
    const response: CharacterDto = {
      id: character.id,
      name: character.name,
      status: (await this.getStatusById(character.statusId)) ?? undefined,
      species: (await this.getSpeciesById(character.speciesId)) ?? undefined,
    };
    return response;
  }

  async getCharactersBySpecies(
    speciesId: number,
    page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    const characterResponse: CharacterDto[] = [];
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    //check if species exists
    const speciesExist = await this.prisma.subcategory.findUnique({
      where: { categoryId: 1, id: speciesId }, // speciesId
    });
    if (!speciesExist) {
      throw new BadRequestException('That kind of species does not exist');
    }
    const characters = await this.prisma.character.findMany({
      where: { speciesId: speciesId },
      skip,
      take: pageSize,
    });
    if (!characters) {
      throw new BadRequestException('No characters found');
    }
    for (let i = 0; i < characters.length; i++) {
      const character: CharacterDto = {
        id: characters[i].id,
        name: characters[i].name,
        status: (await this.getStatusById(characters[i].statusId)) ?? undefined,
        species:
          (await this.getSpeciesById(characters[i].speciesId)) ?? undefined,
      };
      characterResponse.push(character);
    }
    const totalCharacters = await this.prisma.character.count({
      where: { speciesId },
    });
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages
        ? `/character/species/${speciesId}?page=${nextPageNumber}`
        : null;
    const prevPageUrl =
      page > 1
        ? `/character/species/${speciesId}?page=${prevPageNumber}`
        : null;
    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,

      data: characterResponse,
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
    prevPageUrl: string | null;
    data: CharacterDto[];
  }> {
    const characterResponse: CharacterDto[] = [];
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    //check if status exists
    const statusExist = await this.prisma.status.findUnique({
      where: { id: statusId },
    });
    if (!statusExist) {
      throw new BadRequestException('That kind of status does not exist');
    }
    const characters = await this.prisma.character.findMany({
      where: { statusId: statusId },
      skip,
      take: pageSize,
    });
    if (!characters) {
      throw new BadRequestException('No characters found');
    }
    for (let i = 0; i < characters.length; i++) {
      const character: CharacterDto = {
        id: characters[i].id,
        name: characters[i].name,
        status: (await this.getStatusById(characters[i].statusId)) ?? undefined,
        species:
          (await this.getSpeciesById(characters[i].speciesId)) ?? undefined,
      };
      characterResponse.push(character);
    }
    const totalCharacters = await this.prisma.character.count({
      where: { statusId },
    });
    const totalPages = Math.ceil(totalCharacters / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages
        ? `/character/status/${statusId}?page=${nextPageNumber}`
        : null;
    const prevPageUrl =
      page > 1 ? `/character/species/${statusId}?page=${prevPageNumber}` : null;
    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: characterResponse,
    };
  }

  async updateTask(id: number, data: Character): Promise<CharacterDto> {
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
    });

    if (!existingCharacter) {
      throw new BadRequestException('Character not found');
    }
    const speciesId = await this.prisma.categories.findFirst({
      where: { category: 'Species' },
    });
    if (!speciesId) {
      throw new BadRequestException('Category Species not found');
    }
    const charactersId = await this.prisma.statusTypes.findFirst({
      where: { type: 'Characters' },
    });
    if (!charactersId) {
      throw new BadRequestException('StatusType Characters not found');
    }

    const dto: Character = {
      id,
      name: data.name ?? existingCharacter.name,
      statusId: data.statusId ?? existingCharacter.statusId,
      speciesId: data.speciesId ?? existingCharacter.speciesId,
    };

    if (data.speciesId !== existingCharacter.speciesId) {
      const speciesExist = await this.prisma.subcategory.findUnique({
        where: {
          categoryId: speciesId.id, //always 1 for species
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
          statusTypeId: charactersId.id, //always 1 for characters
          id: data.statusId,
        }, // statusId
      });
      if (!statusExist) {
        //if status does not exist, it means its not 1 or 2
        throw new BadRequestException('That kind of status does not exist');
      }
    }

    await this.prisma.character.update({ where: { id }, data: dto });
    const response: CharacterDto = {
      id: dto.id,
      name: dto.name,
      status: await this.getStatusById(dto.statusId),
      species: await this.getSpeciesById(dto.speciesId),
    };
    return response;
  }

  async deleteTask(id: number): Promise<string> {
    //check if exists
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
    });
    if (!existingCharacter) {
      throw new BadRequestException('Character not found');
    }
    const statusTypeCharacter = await this.prisma.statusTypes.findFirst({
      where: { type: 'Characters' },
    });
    const statusSuspendedId = await this.prisma.status.findFirst({
      where: { statusTypeId: statusTypeCharacter.id, status: 'Suspended' },
    });
    if (!statusSuspendedId) {
      throw new BadRequestException('Status Suspended not found');
    }
    //check if already suspended
    if (existingCharacter.statusId === statusSuspendedId.id) {
      return 'Character was already suspended';
    }
    //suspend
    const dto: Character = {
      id,
      name: existingCharacter.name,
      statusId: statusSuspendedId.id, //suspend
      speciesId: existingCharacter.speciesId,
    };
    await this.prisma.character.update({ where: { id }, data: dto });
    return `Character ${dto.name} suspended`;
  }

  async reviveTask(id: number): Promise<string> {
    //check if exists
    const existingCharacter = await this.prisma.character.findUnique({
      where: { id },
    });
    if (!existingCharacter) {
      throw new BadRequestException('Character not found');
    }

    const statusTypeCharacter = await this.prisma.statusTypes.findFirst({
      where: { type: 'Characters' },
    });
    const statusActiveId = await this.prisma.status.findFirst({
      where: { statusTypeId: statusTypeCharacter.id, status: 'Active' },
    });
    if (!statusActiveId) {
      throw new BadRequestException('Status Active not found');
    }
    //check if already suspended
    if (existingCharacter.statusId === statusActiveId.id) {
      return 'Character was already Active';
    }

    const dto: Character = {
      id,
      name: existingCharacter.name,
      statusId: statusActiveId.id, //suspend
      speciesId: existingCharacter.speciesId,
    };
    await this.prisma.character.update({ where: { id }, data: dto });
    return `Character ${dto.name} Active again`;
  }

  async getSpeciesById(id: number): Promise<string> {
    const categorySpeciesId = await this.prisma.categories.findFirst({
      where: { category: 'Species' },
    });
    if (!categorySpeciesId) {
      throw new BadRequestException('Category Species not found');
    }
    const response = await this.prisma.subcategory.findUnique({
      where: { id, categoryId: categorySpeciesId.id },
    });
    //check if exists
    if (!response) {
      throw new BadRequestException('Specie not found');
    }
    return response.subcategory;
  }

  async getStatusById(id: number): Promise<string> {
    const statusTypeCharacter = await this.prisma.statusTypes.findFirst({
      where: { type: 'Characters' },
    });
    if (!statusTypeCharacter) {
      throw new BadRequestException('StatusType Characters not found ');
    }
    const response = await this.prisma.status.findUnique({
      where: { id, statusTypeId: statusTypeCharacter.id },
    });
    //check if exists
    if (!response) {
      throw new BadRequestException('Specie not found');
    }
    return response.status;
  }
}
