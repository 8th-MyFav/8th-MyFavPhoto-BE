async function createTrade(userId, targetCardId, offeredCardId) {
  try {
    // 유저가 offeredCard의 owner인지 검증
    // tradehistory 생성 + 교환 제안 알림 생성
    // response : tradehistory id, trade_status, creat_At, notification_id
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
  createTrade,
};
