-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "photocard_id" INTEGER,
ALTER COLUMN "is_read" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_photocard_id_fkey" FOREIGN KEY ("photocard_id") REFERENCES "UserPhotocards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
