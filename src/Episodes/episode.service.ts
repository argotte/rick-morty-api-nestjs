/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
import { EpisodeDto } from './EpisodeDto/episode.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Episode } from '@prisma/client';
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
        episodeCode: episodes[i].episodeCode,
        air_date: episodes[i].airDate,
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
  async getEpisodeById(id: number): Promise<EpisodeDto> {
    const responseEpisode = await this.prisma.episode.findUnique({
      where: { id},
    });
    //check if exists
    if (!responseEpisode) {
      throw new BadRequestException('Episode not found');
    }
    const response: EpisodeDto = {
      id: responseEpisode.id,
      name: responseEpisode.name,
      episodeCode: responseEpisode.episodeCode,
      air_date: responseEpisode.airDate,
      status: (await this.getStatusById(responseEpisode.statusId)) ?? undefined,
      duration: responseEpisode.duration,
      season:
        (await this.getSubcategoryById(responseEpisode.seasonId)) ?? undefined,
    };
    return response;
  }

  async getStatusById(id: number): Promise<string> {
    const statusTypeEpisodesId = await this.prisma.statusTypes.findFirst({
      where: { type: 'Episodes' },
    });
    if (!statusTypeEpisodesId) {
      throw new BadRequestException('Status type not found');
    }

    const response = await this.prisma.status.findUnique({
      where: { id, statusTypeId: statusTypeEpisodesId.id },
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
        episodeCode: episodes[i].episodeCode,
        air_date: episodes[i].airDate,
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

  async updateEpisode(id: number, data: Episode): Promise<EpisodeDto> {
    const existingEpisode = await this.prisma.episode.findUnique({
      where: { id },
    });

    if (!existingEpisode) {
      throw new BadRequestException('Episode not found');
    }

    const dto: Episode = {
      id,
      name: data.name ?? existingEpisode.name,
      airDate: data.airDate ?? existingEpisode.airDate,
      episodeCode: data.episodeCode ?? existingEpisode.episodeCode,
      duration: data.duration ?? existingEpisode.duration,
      statusId: data.statusId ?? existingEpisode.statusId,
      seasonId: data.seasonId ?? existingEpisode.seasonId,
    };

    if (data.name !== existingEpisode.name) {
      const episodeNameExist = await this.prisma.episode.findFirst({
        where: {
          name: data.name,
        },
      });
      if (episodeNameExist) {
        throw new BadRequestException('That episode name already exists');
      }
    }
    if (data.episodeCode !== existingEpisode.episodeCode) {
      const episodeCodeExist = await this.prisma.episode.findFirst({
        where: {
          episodeCode: data.episodeCode,
        },
      });
      if (episodeCodeExist) {
        throw new BadRequestException('That episode code already exists');
      }
    }
    if (data.seasonId !== existingEpisode.seasonId) {
      const categorySeasonId = await this.prisma.categories.findFirst({
        where: {
          category: 'Season',
        },
      });

      const seasonExist = await this.prisma.subcategory.findUnique({
        where: {
          categoryId: categorySeasonId.id, //should be always 2 for season
          id: data.statusId,
        },
      });

      if (!seasonExist) {
        throw new BadRequestException('That season ID does not exist');
      }
    }
    if (data.statusId !== existingEpisode.statusId) {
      const statusId = await this.prisma.statusTypes.findFirst({
        where: {
          type: 'Episodes',
        },
      });
      const statusExist = await this.prisma.status.findUnique({
        where: {
          statusTypeId: statusId.id, //should be always 2 for episodes
          id: data.statusId,
        }, // statusId
      });
      if (!statusExist) {
        //if status does not exist, it means its not 3 or 4
        throw new BadRequestException('That kind of status does not exist');
      }
    }
    if (dto.airDate) {
      dto.airDate = new Date(dto.airDate);
    }
    await this.prisma.episode.update({ where: { id }, data: dto });
    const response: EpisodeDto = {
      id: dto.id,
      name: dto.name,
      episodeCode: dto.episodeCode,
      air_date: dto.airDate,
      duration: dto.duration,
      status: await this.getStatusById(dto.statusId),
      season: await this.getSubcategoryById(dto.seasonId),
    };
    return response;
  }

  async cancelEpisode(id: number): Promise<string> {
    //check if exists
    const existingEpisode = await this.prisma.episode.findUnique({
      where: { id },
    });
    if (!existingEpisode) {
      throw new BadRequestException('Episode not found');
    }
    const existingStatusType = await this.prisma.statusTypes.findFirst({
      where: { type: 'Episodes' },
    });

    const CancelledId = await this.prisma.status.findFirst({
      where: { statusTypeId: existingStatusType.id, status: 'Cancelled' },
    });

    //check if already suspended
    if (existingEpisode.statusId === CancelledId.id) {
      return 'Episode was already suspended';
    }
    //suspend
    const dto: Episode = {
      id,
      name: existingEpisode.name,
      airDate: existingEpisode.airDate,
      statusId: CancelledId.id, //suspend
      seasonId: existingEpisode.seasonId,
      episodeCode: existingEpisode.episodeCode,
      duration: existingEpisode.duration,
    };
    await this.prisma.episode.update({ where: { id }, data: dto });
    return `Episode ${dto.name},${dto.episodeCode} cancelled`;
  }

  async reactiveEpisode(id: number): Promise<string> {
    //check if exists
    const existingEpisode = await this.prisma.episode.findUnique({
      where: { id },
    });
    if (!existingEpisode) {
      throw new BadRequestException('Episode not found');
    }
    const existingStatusType = await this.prisma.statusTypes.findFirst({
      where: { type: 'Episodes' },
    });

    const activeID = await this.prisma.status.findFirst({
      where: { statusTypeId: existingStatusType.id, status: 'Active' },
    });

    //check if already suspended
    if (existingEpisode.statusId === activeID.id) {
      return 'Episode was already active';
    }
    //suspend
    const dto: Episode = {
      id,
      name: existingEpisode.name,
      airDate: existingEpisode.airDate,
      statusId: activeID.id, //suspend
      seasonId: existingEpisode.seasonId,
      episodeCode: existingEpisode.episodeCode,
      duration: existingEpisode.duration,
    };
    await this.prisma.episode.update({ where: { id }, data: dto });
    return `Episode ${dto.name},${dto.episodeCode} activated`;
  }
}
