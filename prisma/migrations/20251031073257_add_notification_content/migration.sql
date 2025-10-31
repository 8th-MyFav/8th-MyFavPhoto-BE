/*
  Warnings:

  - You are about to drop the column `photocard_id` on the `Notifications` table. All the data in the column will be lost.
  - Added the required column `content` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Notifications" DROP CONSTRAINT "Notifications_photocard_id_fkey";

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "photocard_id",
ADD COLUMN     "content" TEXT NOT NULL;
