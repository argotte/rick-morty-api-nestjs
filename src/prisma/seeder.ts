/* eslint-disable prettier/prettier */
import { Character, Episode, PrismaClient } from '@prisma/client';
import axios from 'axios';
export class Seeder {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed() {
    // Verifica e inserta datos en StatusTypes
    const statusTypeCount = await prisma.statusTypes.count();
    if (statusTypeCount === 0) {
      await prisma.statusTypes.createMany({
        // data: [{ type: 'Active' }, { type: 'Inactive' }],
        data: [{ type: 'Characters' }, { type: 'Episodes' }],
      });
      console.log('StatusTypes insertados');
    }

    // Verifica e inserta datos en Statuses
    const statusCount = await prisma.status.count();
    if (statusCount === 0) {
      const statusType1 = await prisma.statusTypes.findFirst({
        where: { type: 'Characters' },
      });
      const statusType2 = await prisma.statusTypes.findFirst({
        where: { type: 'Episodes' },
      });

      await prisma.status.createMany({
        data: [
          { statusTypeId: statusType1?.id, status: 'Active' },
          { statusTypeId: statusType1?.id, status: 'Suspended' },

          { statusTypeId: statusType2?.id, status: 'Cancelled' },
          { statusTypeId: statusType2?.id, status: 'Active' },
        ],
      });
    }

    // Verifica e inserta datos en Categories
    const categoryCount = await prisma.categories.count();
    if (categoryCount === 0) {
      await prisma.categories.createMany({
        data: [{ category: 'Species' }, { category: 'Season' }],
      });
    }

    // Verifica e inserta datos en Subcategories
    const subcategoryCount = await prisma.subcategory.count();
    if (subcategoryCount === 0) {
      const categorySpecies = await prisma.categories.findFirst({
        where: { category: 'Species' },
      });
      const categorySeason = await prisma.categories.findFirst({
        where: { category: 'Season' },
      });
      const countSpecies = await this.countSpecies(
        'https://rickandmortyapi.com/api/character',
      );
      for (const specie of countSpecies) {
        await prisma.subcategory.create({
          data: { categoryId: categorySpecies?.id, subcategory: specie },
        });
      }
      const countSeasons = await this.countSeasons(
        'https://rickandmortyapi.com/api/episode',
      );
      for (const season of countSeasons) {
        await prisma.subcategory.create({
          data: {
            categoryId: categorySeason?.id,
            subcategory: season,
          },
        });
      }
      // await prisma.subcategory.createMany({
      //   data: [
      //     // { categoryId: categorySpecies?.id, subcategory: 'Human' },
      //     // { categoryId: categorySpecies?.id, subcategory: 'Alien' },
      //     { categoryId: categorySeason?.id, subcategory: 'SEASON 1' },
      //     { categoryId: categorySeason?.id, subcategory: 'SEASON 2' },
      //     { categoryId: categorySeason?.id, subcategory: 'SEASON 3' },
      //     { categoryId: categorySeason?.id, subcategory: 'SEASON 4' },
      //     { categoryId: categorySeason?.id, subcategory: 'SEASON 5' },
      //   ],
      // });
    }

    // Verifica e inserta datos en Characters
    const characterCount = await prisma.character.count();
    if (characterCount === 0) {
      await this.fetchAndInsertCharacters(
        'https://rickandmortyapi.com/api/character',
      );
    }
    const episodeCount = await prisma.episode.count();
    if (episodeCount === 0) {
      await this.fetchAndInsertEpisodes(
        'https://rickandmortyapi.com/api/episode',
      );
    }
    console.log('Datos iniciales insertados (si no estaban presentes)');
  }
  async fetchAndInsertEpisodes(url: string) {
    try {
      const response = await axios.get(url);
      const data = response.data;
      for (const episode of data.results) {
        const StatusTypeFound = await prisma.statusTypes.findFirst({
          where: { type: 'Episodes' },
        });
        const statusFound = await prisma.status.findFirst({
          where: {
            status: {
              equals: 'Active',
              mode: 'insensitive',
            },
            statusTypeId: StatusTypeFound?.id,
          },
        });
        const season = episode.episode.match(/S(\d{2})E\d{2}/);
        const NameSeason = `Season ${season[1]}`;
        const seasonFound = await prisma.subcategory.findFirst({
          where: {
            subcategory: {
              equals: NameSeason,
              mode: 'insensitive',
            },
          },
        })
        const dto: Episode = {
          id: episode.id as number,
          name: episode.name as string,
          airDate: new Date(episode.air_date as string),
          episodeCode: episode.episode as string,
          statusId: (statusFound?.id as number) ?? undefined,
          duration: 23,
          seasonId: (seasonFound?.id as number)?? undefined,
        };
        await prisma.episode.create({ data: dto });
        console.log('Episodio insertado');
      }
      if (data.info.next) {
        await this.fetchAndInsertEpisodes(data.info.next);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async countSpecies(
    url: string,
    speciesSet = new Set<string>(),
  ): Promise<Set<string>> {
    try {
      const response = await axios.get(url);
      const data = response.data;

      for (const character of data.results) {
        if (character.species) {
          speciesSet.add(character.species.toLowerCase());
        }
      }
      if (data.info.next) {
        await this.countSpecies(data.info.next, speciesSet);
      }
    } catch (e) {
      console.log(e);

      return new Set<string>();
    }
    console.log(`Number of unique species: ${speciesSet.size}`);
    return speciesSet;
  }

  async countSeasons(url: string, seasonSet = new Set<string>()) {
    try {
      const response = await axios.get(url);
      const data = response.data;
      for (const episode of data.results) {
        if (episode.episode) {
          const season = episode.episode.match(/S(\d{2})E\d{2}/);
          if (season) {
            seasonSet.add(`Season ${season[1]}`);
          }
        }
      }
      if (data.info.next) {
        await this.countSeasons(data.info.next, seasonSet);
      }
    } catch (e) {
      console.log(e);
      return new Set<string>();
    }
    return seasonSet;
  }

  async fetchAndInsertCharacters(url: string) {
    try {
      const response = await axios.get(url);
      const data = response.data;
      for (const character of data.results) {
        const specieTaked = (character.species as string).toLowerCase();
        // if (specieTaked === 'human') specieTaked = 'Human';
        // else specieTaked = 'Alien';
        let statusTaked = (character.status as string).toLowerCase();
        if (statusTaked === 'alive') statusTaked = 'Active';
        else statusTaked = 'Suspended';
        const specieFound = await prisma.subcategory.findFirst({
          where: {
            subcategory: {
              equals: specieTaked,
              mode: 'insensitive',
            },
          },
        }); // Busque en subcategory donde haya Human
        const StatusTypeFound = await prisma.statusTypes.findFirst({
          where: { type: 'Characters' },
        });
        console.log(StatusTypeFound);
        const statusFound = await prisma.status.findFirst({
          where: {
            status: {
              equals: statusTaked,
              mode: 'insensitive',
            },
            statusTypeId: StatusTypeFound?.id,
          },
        });

        const dto: Character = {
          id: character.id,
          name: character.name,
          statusId: statusFound?.id ?? undefined,
          speciesId: specieFound?.id ?? undefined,
          // status: character.status,
          // species: character.species,
        };
        await prisma.character.create({ data: dto });
      }
      if (data.info.next) {
        await this.fetchAndInsertCharacters(data.info.next);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const prisma = new PrismaClient();



//In case you may need this...... 
//if you wanna delete all data from the database
// DELETE  from "Subcategory";Alter SEQUENCE  "Subcategory_id_seq" RESTART  with  1;

// DELETE FROM "StatusTypes";Alter SEQUENCE  "StatusTypes_id_seq" RESTART  with  1;

// DELETE FROM "Status";Alter SEQUENCE  "Status_id_seq" RESTART  with  1;

// DELETE FROM "Categories"; Alter SEQUENCE  "Categories_id_seq" RESTART  with  1;

// DELETE FROM "Character";
// DELETE FROM "Episode";

// DELETE FROM "CharacterEpisodes"; Alter SEQUENCE "CharacterEpisodes_id_seq" RESTART with 1;
