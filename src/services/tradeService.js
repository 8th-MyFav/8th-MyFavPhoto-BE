import tradeRepository from "../repositories/tradeRepository.js";
import * as errors from "../utils/errors.js";
import validate from "../utils/validate.js";

async function createTrade(userId, targetCardId, offeredCardId, content) {
  try {
    // target 카드 존재 확인
    await validate.isEntityExist(targetCardId, "userPhotocards");

    // tradehistory 생성 + 교환 제안 알림 생성
    const tradeHistory = await tradeRepository.create(
      userId,
      targetCardId,
      offeredCardId,
      content
    );

    return tradeHistory;
  } catch (error) {
    if ([401, 404, 409].includes(error.code)) {
      throw error;
    }

    throw errors.internalServerError();
  }
}

async function getTradesHistory(cardId) {
  try {
    // 카드 존재 확인
    const tradeHistories = await tradeRepository.findByCardId(cardId);

    if (!tradeHistories) {
      throw errors.tradeNotFound("제안 내역이 없습니다.");
    }

    // 교환 제안 목록 + 제안한 카드의 정보 포함 (offeredCard Info 필요)
    return tradeHistories;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

export default {
  getTradesHistory,
  createTrade,
};
