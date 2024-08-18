/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
import { EpisodeDto } from './EpisodeDto/episode.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
// import { EpisodeDto } from './EpisodeDto/episode.dto';
@Injectable()
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
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    const episodes = await this.prisma.episode.findMany({
      skip,
      take: pageSize,
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
        season:
          (await this.getSubcategoryById(episodes[i].seasonId)) ?? undefined,
      };
      episodeResponse.push(episode);
    }
    const totalEpisodes = await this.prisma.episode.count();
    const totalPages = Math.ceil(totalEpisodes / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages ? `/episode?page=${nextPageNumber}` : null;
    const prevPageUrl = page > 1 ? `/episode?page=${prevPageNumber}` : null;

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

  async getSubcategoryById(id: number): Promise<string> {
    const response = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    //check if exists
    if (!response) {
      throw new BadRequestException('Specie not found');
    }
    return response.subcategory;
  }

  async getEpisodesBySeasonNumber(
    seasonNumber: number,
    page: number = 1,
  ): Promise<{
    totalEpisodes: number;
    currentPage: number;
    totalPages: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
    data: EpisodeDto[];
  }> {
    const episodeResponse: EpisodeDto[] = [];
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    let seasonStr = seasonNumber.toString();
    if (seasonNumber < 10) {
      seasonStr = '0' + seasonStr;
    }
    seasonStr = 'Season ' + seasonStr;
    const subcategoryFound = await this.prisma.subcategory.findFirst({
      where: { subcategory: seasonStr },
    });
    if (!subcategoryFound) {
      throw new BadRequestException('Season not found');
    }
    const episodes = await this.prisma.episode.findMany({
      where: { seasonId: subcategoryFound.id },
      skip,
      take: pageSize,
    });
    if (!episodes) {
      throw new BadRequestException('No episodes found');
    }
    for (let i = 0; i < episodes.length; i++) {
      const episode: EpisodeDto = {
        id: episodes[i].id,
        name: episodes[i].name,
        air_date: episodes[i].airDate,
        episode: episodes[i].episodeCode,
        status: (await this.getStatusById(episodes[i].statusId)) ?? undefined,
        duration: episodes[i].duration,
        season:
          (await this.getSubcategoryById(episodes[i].seasonId)) ?? undefined,
      };
      episodeResponse.push(episode);
    }
    const totalEpisodes = await this.prisma.episode.count({
      where: { seasonId: subcategoryFound.id },
    });
    const totalPages = Math.ceil(totalEpisodes / pageSize);
    let nextPageNumber: number = page;
    nextPageNumber++;
    let prevPageNumber: number = page;
    prevPageNumber--;
    const nextPageUrl =
      page < totalPages
        ? `/season/${seasonNumber}?page=${nextPageNumber}`
        : null;
    const prevPageUrl =
      page > 1 ? `/season/${seasonNumber}?page=${prevPageNumber}` : null;

    return {
      totalEpisodes,
      currentPage: page,
      totalPages,
      nextPageUrl,
      prevPageUrl,
      data: episodeResponse,
    };
  }
}
