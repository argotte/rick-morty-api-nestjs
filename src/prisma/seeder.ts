/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
export class Seeder {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed(){
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

      await prisma.subcategory.createMany({
        data: [
          { categoryId: categorySpecies?.id, subcategory: 'Human' },
          { categoryId: categorySpecies?.id, subcategory: 'Alien' },
          { categoryId: categorySeason?.id, subcategory: 'SEASON 1' },
          { categoryId: categorySeason?.id, subcategory: 'SEASON 2' },
          { categoryId: categorySeason?.id, subcategory: 'SEASON 3' },
          { categoryId: categorySeason?.id, subcategory: 'SEASON 4' },
          { categoryId: categorySeason?.id, subcategory: 'SEASON 5' },
        ],
      });
    }

    // // Verifica e inserta datos en Characters
    // const characterCount = await prisma.character.count();
    // if (characterCount === 0) {
    //   const status1 = await prisma.status.findFirst({
    //     where: { status: 'Online' },
    //   });

    //   await prisma.character.create({
    //     data: {
    //       id: 1,
    //       name: 'Character1',
    //       statusId: status1?.id,
    //       // species: 'Human',
    //     },
    //   });
    // }

    // // Verifica e inserta datos en Episodes
    // const episodeCount = await prisma.episode.count();
    // if (episodeCount === 0) {
    //   const status1 = await prisma.status.findFirst({
    //     where: { status: 'Online' },
    //   });

    //   await prisma.episode.create({
    //     data: {
    //       id: 1,
    //       name: 'Episode1',
    //       airDate: new Date(),
    //       episodeCode: 'E01',
    //       statusId: status1?.id,
    //       duration: 45,
    //     },
    //   });
    // }

    // // Verifica e inserta datos en CharacterEpisodes
    // const characterEpisodeCount = await prisma.characterEpisodes.count();
    // if (characterEpisodeCount === 0) {
    //   const character1 = await prisma.character.findFirst({
    //     where: { name: 'Character1' },
    //   });
    //   const episode1 = await prisma.episode.findFirst({
    //     where: { name: 'Episode1' },
    //   });

    //   await prisma.characterEpisodes.create({
    //     data: {
    //       characterId: character1?.id,
    //       episodeId: episode1?.id,
    //       startTime: 0,
    //       endTime: 45,
    //     },
    //   });
    // }

    console.log('Datos iniciales insertados (si no estaban presentes)');
  }
}

const prisma = new PrismaClient();

// async function main() {
//   const seeder = new Seeder();
//   await seeder.seed();

// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
