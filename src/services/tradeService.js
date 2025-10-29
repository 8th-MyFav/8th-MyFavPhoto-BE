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

    console.log(error);

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

async function getTradesHistory(userId, cardId) {
  
}

export default {
  createTrade,
};
