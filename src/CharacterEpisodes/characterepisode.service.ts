/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacterEpisodeDto } from './CharacterEpisodeDto/characterepisode.dto';
import { TaskService } from 'src/Task/task.service';
import { EpisodeService } from 'src/Episodes/episode.service';
import { CreateCharacterEpisodeDto } from './CharacterEpisodeDto/createCharacterEpisode.dto';

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

    const nextPageUrl =
      page < totalPages ? `/characterepisode?page=${page + 1}` : null;
    const prevPageUrl = page > 1 ? `/characterepisode?page=${page - 1}` : null;
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
}
