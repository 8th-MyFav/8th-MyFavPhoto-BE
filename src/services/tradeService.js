import tradeRepository from "../repositories/tradeRepository.js";

async function createTrade(userId, targetCardId, offeredCardId, content) {
  try {
    // 유저가 offeredCard의 생성자인지 검증

    // tradehistory 생성 + 교환 제안 알림 생성
    const tradeHistory = await tradeRepository.create(
      userId,
      targetCardId,
      offeredCardId,
      content
    );

    return tradeHistory;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

async function getTradesHistory(userId, cardId) {
  try {
    // 카드 존재 확인
    const tradeHistories = await tradeRepository.findByCardId(cardId);

    if (!tradeHistories) {
      const error = new Error("제안내역이 없습니다.");
      error.code = 404;
      throw error;
    }

    // 교환 제안 목록 + 제안한 카드의 정보 포함 (offeredCard Info 필요)
    return tradeHistories;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export default {
  getTradesHistory,
  createTrade,
};
