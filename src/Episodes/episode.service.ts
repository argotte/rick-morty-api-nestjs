/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
import { EpisodeDto } from './EpisodeDto/episode.dto';
import { BadRequestException } from '@nestjs/common';
// import { EpisodeDto } from './EpisodeDto/episode.dto';

export class EpisodeService {
  constructor(private prisma: PrismaService) {}

  async getAllEpisodes(page: number = 1): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: EpisodeDto[];
  }> {
    const episodeResponse: EpisodeDto[] = [];
    const episodes = await this.prisma.episode.findMany({
      skip: (page - 1) * 20,
      take: 20,
    });
    if (!episodes) {
      throw new BadRequestException('No characters found');
    }
    for (let i = 0; i < episodes.length; i++) {
      const episode: EpisodeDto = {
        id: episodes[i].id,
        name: episodes[i].name,
        air_date: episodes[i].airDate,
        episode: episodes[i].episodeCode,
        status: (await this.getStatusById(episodes[i].statusId)) ?? undefined,
        duration: episodes[i].duration,
      };
      episodeResponse.push(episode);
    }
    const totalEpisodes = await this.prisma.episode.count();
    const totalPages = Math.ceil(totalEpisodes / 20);

    const nextPageUrl = page < totalPages ? `/episodes?page=${page + 1}` : null;
    const prevPageUrl = page > 1 ? `/episodes?page=${page - 1}` : null;

    return {
      totalEpisodes,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: episodeResponse,
    };
  }

  async getStatusById(id: number): Promise<string> {
    const response = await this.prisma.status.findUnique({
      where: { id, statusTypeId: 2 },
    });
    //check if exists
    if (!response) {
      throw new BadRequestException('Specie not found');
    }
    return response.status;
  }
}
