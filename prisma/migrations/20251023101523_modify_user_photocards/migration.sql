/*
  Warnings:

  - You are about to drop the column `ganre` on the `Photocards` table. All the data in the column will be lost.
  - You are about to drop the column `trade_ganre` on the `TradePosts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('KPOP', 'ACTOR', 'ESPORTS', 'KBO', 'ANIMATION');

-- DropForeignKey
ALTER TABLE "public"."UserPhotocards" DROP CONSTRAINT "UserPhotocards_trade_info_id_fkey";

-- AlterTable
ALTER TABLE "Photocards" DROP COLUMN "ganre",
ADD COLUMN     "genre" "Genre" NOT NULL DEFAULT 'KPOP',
ALTER COLUMN "grade" SET DEFAULT 'COMMON';

-- AlterTable
ALTER TABLE "TradePosts" DROP COLUMN "trade_ganre",
ADD COLUMN     "trade_genre" "Genre" NOT NULL DEFAULT 'KPOP',
ALTER COLUMN "trade_grade" SET DEFAULT 'COMMON';

-- AlterTable
ALTER TABLE "UserPhotocards" ALTER COLUMN "trade_info_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."Ganre";

-- AddForeignKey
ALTER TABLE "UserPhotocards" ADD CONSTRAINT "UserPhotocards_trade_info_id_fkey" FOREIGN KEY ("trade_info_id") REFERENCES "TradePosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
