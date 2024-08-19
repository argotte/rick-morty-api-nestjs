/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacterEpisodeDto } from './CharacterEpisodeDto/characterepisode.dto';
import { TaskService } from 'src/Task/task.service';
import { EpisodeService } from 'src/Episodes/episode.service';
import { CreateCharacterEpisodeDto } from './CharacterEpisodeDto/createCharacterEpisode.dto';
import { CharacterEpisodeForAllByCharacterStatusIdDto } from './CharacterEpisodeDto/characterepisodeForAllByCharacterStatusId.dto';
import { CharacterEpisodeAllFilterDto } from './CharacterEpisodeDto/characterEpisodeAllFilter.dto';

@Injectable()
export class CharacterEpisodeService {
  constructor(
    private prisma: PrismaService,
    private episodeService: EpisodeService,
    private characterService: TaskService,
  ) {}
  async getAllInteractions(page: number = 1): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeDto[];
  }> {
    const characterEpisodeResponse: CharacterEpisodeDto[] = [];
    const take = 10;
    const skip = (page - 1) * take;
    const totalEpisodes = await this.prisma.characterEpisodes.count();
    const totalPages = Math.ceil(totalEpisodes / take);
    const characterepisodes = await this.prisma.characterEpisodes.findMany({
      take,
      skip,
    });
    if (!characterepisodes || characterepisodes.length === 0) {
      throw new BadRequestException('No character-episodes relations found');
    }
    for (let i = 0; i < characterepisodes.length; i++) {
      const characterResponse = await this.characterService.getTaskById(
        characterepisodes[i].characterId,
      );
      const episodeResponse = await this.episodeService.getEpisodeById(
        characterepisodes[i].episodeId,
      );
      const characterEpisode: CharacterEpisodeDto = {
        id: characterepisodes[i].id,
        character: characterResponse.name,
        episode: episodeResponse.name,
        init: characterepisodes[i].init,
        finish: characterepisodes[i].finish,
      };
      characterEpisodeResponse.push(characterEpisode);
    }
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages ? `/characterepisode?page=${nextPageNumber}` : null;
    const prevPageUrl =
      page > 1 ? `/characterepisode?page=${prevPageNumber}` : null;
    return {
      totalEpisodes,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: characterEpisodeResponse,
    };
  }

  async createCharacterEpisode(
    data: CreateCharacterEpisodeDto,
  ): Promise<CharacterEpisodeDto> {
    const character = await this.characterService.getTaskById(data.characterId);
    const episode = await this.episodeService.getEpisodeById(data.episodeId);
    if (!character || !episode) {
      throw new BadRequestException('Character or Episode not found');
    }
    // Validate init and finish format
    const timeFormat = /^\d{2}:\d{2}$/;
    if (!timeFormat.test(data.init) || !timeFormat.test(data.finish)) {
      throw new BadRequestException(
        'Init and Finish must be in the format "mm:ss"',
      );
    }
    const minutesOfEpisode: number = episode.duration;
    const episodeDurationInSeconds = minutesOfEpisode * 60;

    // Convert init and finish to secondsss
    const [initMinutes, initSeconds] = data.init.split(':').map(Number);
    const [finishMinutes, finishSeconds] = data.finish.split(':').map(Number);
    const initTime = initMinutes * 60 + initSeconds;
    const finishTime = finishMinutes * 60 + finishSeconds;

    // validate initTime and finishTime in episode duration
    if (
      initTime > episodeDurationInSeconds ||
      finishTime > episodeDurationInSeconds
    ) {
      throw new BadRequestException(
        `Init and Finish times must be within the episode duration of ${minutesOfEpisode} minutes`,
      );
    }

    // Validate que initTime>finishTime
    if (initTime >= finishTime) {
      throw new BadRequestException('Init time must be less than Finish time');
    }

    // validate if time overlay
    const overlappingEpisodes = await this.prisma.characterEpisodes.findMany({
      where: {
        characterId: data.characterId,
        episodeId: data.episodeId,
        OR: [
          {
            init: {
              lte: data.finish,
            },
            finish: {
              gte: data.init,
            },
          },
        ],
      },
    });

    // Convert overlapping episode times to seconds for comparison
    const hasOverlap = overlappingEpisodes.some((episode) => {
      const [existingInitMinutes, existingInitSeconds] = episode.init
        .split(':')
        .map(Number);
      const [existingFinishMinutes, existingFinishSeconds] = episode.finish
        .split(':')
        .map(Number);
      const existingInitTime = existingInitMinutes * 60 + existingInitSeconds;
      const existingFinishTime =
        existingFinishMinutes * 60 + existingFinishSeconds;

      return (
        (initTime >= existingInitTime && initTime < existingFinishTime) ||
        (finishTime > existingInitTime && finishTime <= existingFinishTime) ||
        (initTime <= existingInitTime && finishTime >= existingFinishTime)
      );
    });

    if (hasOverlap) {
      throw new BadRequestException(
        'Character already appears in this episode during the specified time interval',
      );
    }

    const characterEpisode = await this.prisma.characterEpisodes.create({
      data: {
        characterId: data.characterId,
        episodeId: data.episodeId,
        init: data.init,
        finish: data.finish,
      },
    });

    const response: CharacterEpisodeDto = {
      id: characterEpisode.id,
      character: character.name,
      episode: episode.name,
      init: characterEpisode.init,
      finish: characterEpisode.finish,
    };
    return response;
  }

  async getCharacterEpisodeById(id: number): Promise<CharacterEpisodeDto> {
    const characterEpisode = await this.prisma.characterEpisodes.findUnique({
      where: {
        id,
      },
    });
    if (!characterEpisode) {
      throw new BadRequestException('Character-Episode relation not found');
    }
    const character = await this.characterService.getTaskById(
      characterEpisode.characterId,
    );
    const episode = await this.episodeService.getEpisodeById(
      characterEpisode.episodeId,
    );
    const response: CharacterEpisodeDto = {
      id: characterEpisode.id,
      character: character.name,
      episode: episode.name,
      init: characterEpisode.init,
      finish: characterEpisode.finish,
    };
    return response;
  }

  async getRelationsByCharacterStatusId(
    statusId: number,
    page: number = 1,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeForAllByCharacterStatusIdDto[];
  }> {
    const characterEpisodeResponse: CharacterEpisodeForAllByCharacterStatusIdDto[] =
      [];
    const take = 10;
    const skip = (page - 1) * take;
    const charactersByStatus = await this.prisma.character.findMany({
      where: {
        statusId: statusId,
      },
    });

    const statusName = await this.prisma.status.findUnique({
      where: {
        id: statusId,
      },
    });

    if (!statusName) {
      throw new BadRequestException('Status not found');
    }
    if (!charactersByStatus || charactersByStatus.length === 0) {
      throw new BadRequestException('No characters found with this status');
    }
    const AllRelations = await this.prisma.characterEpisodes.findMany({
      where: {
        characterId: {
          in: charactersByStatus.map((character) => character.id),
        },
      },
      take,
      skip,
    });
    if (!AllRelations || AllRelations.length === 0) {
      throw new BadRequestException('No character-episodes relations found!!!');
    }

    const totalCharacters = AllRelations.length;
    const totalPages = Math.ceil(totalCharacters / take);
    if (!AllRelations || AllRelations.length === 0) {
      throw new BadRequestException('No character-episodes relations found!!!');
    }
    for (let i = 0; i < AllRelations.length; i++) {
      const characterResponse = await this.characterService.getTaskById(
        AllRelations[i].characterId,
      );
      const episodeResponse = await this.episodeService.getEpisodeById(
        AllRelations[i].episodeId,
      );
      const characterEpisode: CharacterEpisodeForAllByCharacterStatusIdDto = {
        id: AllRelations[i].id,
        character: characterResponse.name,
        episode: episodeResponse.name,
        init: AllRelations[i].init,
        finish: AllRelations[i].finish,
        status: statusName.status,
      };
      characterEpisodeResponse.push(characterEpisode);
    }
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages
        ? `/characterepisode/statusCharacter/${statusId}?page=${nextPageNumber}`
        : null;
    const prevPageUrl =
      page > 1
        ? `/characterepisode/statusCharacter/${statusId}?page=${prevPageNumber}`
        : null;
    return {
      totalCharacters,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: characterEpisodeResponse,
    };
  }

  async getRelationsByFilters(
    page: number = 1,
    statusIdCharacter?: number,
    statusIdEpisode?: number,
    seasonId?: number,
  ): Promise<{
    totalCharacters: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: CharacterEpisodeAllFilterDto[];
  }> {
    const characterEpisodeResponse: CharacterEpisodeAllFilterDto[] = [];
    const take = 5;
    const skip = (page - 1) * take;

    // Obtener personajes por estado
    const charactersByStatus = await this.prisma.character.findMany({
      where: {
        statusId: statusIdCharacter,
      },
    });

    // Obtener nombre del estado del personaje
    const statusName = await this.prisma.status.findUnique({
      where: {
        id: statusIdCharacter,
      },
    });

    // Obtener episodios por estado
    const episodesByStatus = await this.prisma.episode.findMany({
      where: {
        statusId: statusIdEpisode,
      },
    });

    // Obtener nombre del estado del episodio
    const statusEpisodeName = await this.prisma.status.findUnique({
      where: {
        id: statusIdEpisode,
      },
    });

    // Obtener categoría de la temporada
    const seasonIdCategory = await this.prisma.categories.findFirst({
      where: {
        category: 'Season',
      },
    });

    // Obtener subcategoría de la temporada
    const whichSeason = await this.prisma.subcategory.findFirst({
      where: {
        categoryId: seasonIdCategory.id,
        id: seasonId,
      },
    });

    // Verificar si se encontraron personajes y episodios
    if (
      charactersByStatus.length === 0 ||
      episodesByStatus.length === 0 ||
      !whichSeason
    ) {
      throw new BadRequestException('Not found!!');
    }

    // Obtener relaciones de personajes y episodios
    const AllRelations = await this.prisma.characterEpisodes.findMany({
      where: {
        characterId: {
          in: charactersByStatus.map((character) => character.id),
        },
        episode: {
          id: {
            in: episodesByStatus.map((episode) => episode.id),
          },
          seasonId: whichSeason.id,
        },
      },
      take,
      skip,
    });

    if (!AllRelations || AllRelations.length === 0) {
      throw new BadRequestException('No character-episodes relations found!!');
    }

    // Construir la respuesta
    for (let i = 0; i < AllRelations.length; i++) {
      const characterResponse = await this.characterService.getTaskById(
        AllRelations[i].characterId,
      );
      const episodeResponse = await this.episodeService.getEpisodeById(
        AllRelations[i].episodeId,
      );
      const characterEpisode: CharacterEpisodeAllFilterDto = {
        id: AllRelations[i].id,
        character: characterResponse.name,
        episode: episodeResponse.name,
        init: AllRelations[i].init,
        finish: AllRelations[i].finish,
        statusCharacter: statusName.status,
        statusEpisode: statusEpisodeName.status,
        season: whichSeason.subcategory,
      };
      characterEpisodeResponse.push(characterEpisode);
    }
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    return {
      totalCharacters: characterEpisodeResponse.length,
      currentPage: page,
      totalPages: Math.ceil(characterEpisodeResponse.length / take),

      nextPageUrl:
        page * take < characterEpisodeResponse.length
          ? `/characterepisode/filters?page=${nextPageNumber}&statusIdCharacter=${statusIdCharacter}&statusIdEpisode=${statusIdEpisode}&seasonId=${seasonId}`
          : null,
      prevPageUrl:
        page > 1
          ? `/characterepisode/filters?page=${prevPageNumber}&statusIdCharacter=${statusIdCharacter}&statusIdEpisode=${statusIdEpisode}&seasonId=${seasonId}`
          : null,
      data: characterEpisodeResponse,
    };
    //http://localhost:3000/characterepisode/filters?page=1&statusIdCharacter=1&statusIdEpisode=3&seasonId=11
  }

  async deleteCharacterEpisode(id: number): Promise<boolean> {
    const result = await this.prisma.characterEpisodes.delete({
      where: {
        id,
      },
    });
    if (!result) {
      throw new BadRequestException('Character-Episode relation not found');
    }
    return true;
  }
}
