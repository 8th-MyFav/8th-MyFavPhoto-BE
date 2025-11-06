import prisma from "../config/prisma.js";
import tradeRepository from "../repositories/tradeRepository.js";
import userCardRepository from "../repositories/userCardRepository.js";
import * as errors from "../utils/errors.js";

// NOTE: 해당 테이블에 존재하는지 확인
async function isEntityExist(id, modelName) {
  const modelClient = prisma[modelName];

  if (!modelClient)
    throw new Error(`유효하지 않은 model 명입니다. !!${modelName}!!`);

  const record = await modelClient.findUnique({ where: { id: id } });

  if (!record) throw errors.notFound(modelName);
}

// NOTE: 내 "카드 목록"에 판매 중이 아닌 카드가 있는지 확인하는 함수, is_sale: false가 있는가?
async function isCardInStock(
  photocardId,
  ownerId,
  msg = "카드의 재고가 없습니다."
) {
  const card = await userCardRepository.findUnsoldPhotocards(
    photocardId,
    ownerId
  );

  if (!card) {
    throw errors.cannotOnSaleCard(msg);
  }
}

// NOTE: 동일한 카드의 제안 생성 금지
async function validatePropose(offeredCardId, targetCardId) {
  const existTradeHistory = await tradeRepository.existsDuplicateTradeCards(
    offeredCardId,
    targetCardId
  );

  if (existTradeHistory)
    throw errors.invalidTradeStatus("이미 존재하는 교환입니다.");
}

export default {
  isEntityExist,
  isCardInStock,
  validatePropose,
};
