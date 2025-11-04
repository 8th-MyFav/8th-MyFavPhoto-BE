/*
  Warnings:

  - You are about to drop the column `total_count` on the `Photocards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Photocards" DROP COLUMN "total_count",
ADD COLUMN     "total_issued" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TradePosts" ADD COLUMN     "total_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "trade_note" DROP NOT NULL;
