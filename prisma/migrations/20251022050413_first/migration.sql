-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "Ganre" AS ENUM ('KPOP', 'ACTOR', 'ESPORTS', 'KBO', 'ANIMATION');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'REJECED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Photocards" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "grade" "Grade" NOT NULL,
    "ganre" "Ganre" NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT,
    "description" TEXT,
    "total_count" INTEGER NOT NULL,

    CONSTRAINT "Photocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhotocards" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "photocards_id" INTEGER NOT NULL,
    "trade_info_id" INTEGER NOT NULL,
    "is_sale" BOOLEAN NOT NULL,

    CONSTRAINT "UserPhotocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradePosts" (
    "id" SERIAL NOT NULL,
    "trade_grade" "Grade" NOT NULL,
    "trade_ganre" "Ganre" NOT NULL,
    "trade_note" TEXT NOT NULL,

    CONSTRAINT "TradePosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeHistories" (
    "id" SERIAL NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "offered_card_id" INTEGER NOT NULL,
    "target_card_id" INTEGER NOT NULL,
    "trade_status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "trade_content" TEXT,

    CONSTRAINT "TradeHistories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseHistories" (
    "id" SERIAL NOT NULL,
    "purchaser_id" INTEGER NOT NULL,
    "purchase_card_id" INTEGER NOT NULL,

    CONSTRAINT "PurchaseHistories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" SERIAL NOT NULL,
    "acc_point" INTEGER,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photocards" ADD CONSTRAINT "Photocards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhotocards" ADD CONSTRAINT "UserPhotocards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhotocards" ADD CONSTRAINT "UserPhotocards_photocards_id_fkey" FOREIGN KEY ("photocards_id") REFERENCES "Photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhotocards" ADD CONSTRAINT "UserPhotocards_trade_info_id_fkey" FOREIGN KEY ("trade_info_id") REFERENCES "TradePosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistories" ADD CONSTRAINT "TradeHistories_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistories" ADD CONSTRAINT "TradeHistories_offered_card_id_fkey" FOREIGN KEY ("offered_card_id") REFERENCES "UserPhotocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistories" ADD CONSTRAINT "TradeHistories_target_card_id_fkey" FOREIGN KEY ("target_card_id") REFERENCES "UserPhotocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistories" ADD CONSTRAINT "PurchaseHistories_purchaser_id_fkey" FOREIGN KEY ("purchaser_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistories" ADD CONSTRAINT "PurchaseHistories_purchase_card_id_fkey" FOREIGN KEY ("purchase_card_id") REFERENCES "UserPhotocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
