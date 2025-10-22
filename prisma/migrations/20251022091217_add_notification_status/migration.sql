/*
  Warnings:

  - The `category` column on the `Notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PURCHASED', 'SOLD', 'SOLD_OUT', 'TRADE_OFFERED', 'TRADE_ACCEPTED', 'TRADE_REJECTED');

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "category",
ADD COLUMN     "category" "NotificationStatus" NOT NULL DEFAULT 'PURCHASED';
