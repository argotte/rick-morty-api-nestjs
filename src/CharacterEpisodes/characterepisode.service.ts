/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CharacterEpisodeDto } from './CharacterEpisodeDto/characterepisode.dto';
import { TaskService } from 'src/Task/task.service';
import { EpisodeService } from 'src/Episodes/episode.service';

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
        init: '',
        finish: '',
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
}
