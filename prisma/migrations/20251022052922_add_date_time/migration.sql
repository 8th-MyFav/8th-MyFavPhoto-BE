/*
  Warnings:

  - Added the required column `updatedAt` to the `Notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Photocards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Points` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseHistories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TradeHistories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TradePosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPhotocards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Photocards" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Points" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseHistories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TradeHistories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TradePosts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserPhotocards" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
