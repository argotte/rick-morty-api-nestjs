/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
// import { EpisodeDto } from './EpisodeDto/episode.dto';

export class EpisodeService {
  constructor(private prismaService: PrismaService) {}

//   async getAllEpisodes(page: number = 1): Promise<{
//     totalEpisodes: number;
//     currentPage: number;
//     totalPages: number;
//     nextPageUrl: string | null;
//     prevPageUrl: string | null;
//     data: EpisodeDto[];
//   }> {
//     const episodes = await this.prismaService.episode.findMany({
//       skip: (page - 1) * 20,
//       take: 20,
//     });

//     const totalEpisodes = await this.prismaService.episode.count();
//     const totalPages = Math.ceil(totalEpisodes / 20);

//     const nextPageUrl = page < totalPages ? `/episodes?page=${page + 1}` : null;
//     const prevPageUrl = page > 1 ? `/episodes?page=${page - 1}` : null;

//     return {
//       totalEpisodes,
//       currentPage: page,
//       totalPages,
//       nextPageUrl,
//       prevPageUrl,
//       data: episodes,
//     };
//   }
}
