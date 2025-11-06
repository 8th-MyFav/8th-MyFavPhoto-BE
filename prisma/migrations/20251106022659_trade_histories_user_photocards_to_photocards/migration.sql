-- DropForeignKey
ALTER TABLE "public"."PurchaseHistories" DROP CONSTRAINT "PurchaseHistories_purchase_card_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TradeHistories" DROP CONSTRAINT "TradeHistories_offered_card_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TradeHistories" DROP CONSTRAINT "TradeHistories_target_card_id_fkey";

-- AddForeignKey
ALTER TABLE "TradeHistories" ADD CONSTRAINT "TradeHistories_offered_card_id_fkey" FOREIGN KEY ("offered_card_id") REFERENCES "Photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeHistories" ADD CONSTRAINT "TradeHistories_target_card_id_fkey" FOREIGN KEY ("target_card_id") REFERENCES "Photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseHistories" ADD CONSTRAINT "PurchaseHistories_purchase_card_id_fkey" FOREIGN KEY ("purchase_card_id") REFERENCES "Photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
