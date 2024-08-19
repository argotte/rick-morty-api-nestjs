/*
  Warnings:

  - You are about to drop the column `endTime` on the `CharacterEpisodes` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `CharacterEpisodes` table. All the data in the column will be lost.
  - Added the required column `finish` to the `CharacterEpisodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `init` to the `CharacterEpisodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterEpisodes" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "finish" TEXT NOT NULL,
ADD COLUMN     "init" TEXT NOT NULL;
