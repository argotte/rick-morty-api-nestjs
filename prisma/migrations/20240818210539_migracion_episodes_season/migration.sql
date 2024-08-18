-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "seasonId" INTEGER;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
