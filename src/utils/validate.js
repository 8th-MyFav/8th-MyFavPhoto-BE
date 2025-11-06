import prisma from "../config/prisma.js";
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

// NOTE: "카드 목록"에 판매 중이 아닌 카드가 있는지 확인하는 함수, 재고가 남아있는가
async function isCardInStock(photocardId) {
  const count = await userCardRepository.countUnsoldPhotocards(photocardId);

  console.log("count: ", count);
  if (count === 0) {
    throw errors.cannotOfferOnSaleCard();
  }
}

export default {
  isEntityExist,
  isCardInStock,
};
