import tradeService from "../services/tradeService.js";

// NOTE: 교환 제안
export async function proposeTrade(req, res, next) {
  try {
    const { userId } = req.auth;
    const { cardId: targetCardId } = req.params;
    const { offeredCardId, content } = req.body;

    // query, body 유효성 검사

    const trades = await tradeService.createTrade(
      Number(userId),
      Number(targetCardId),
      Number(offeredCardId),
      content
    );

    return res.status(200).json(trades);
  } catch (error) {
    next(error);
  }
}

// NOTE: 교환 제시 목록 조회
export async function getOfferedTradesHistory(req, res, next) {
  try {
    const { userId } = req.auth;
    const { cardId } = req.params;

    // query 유효성 검사

    
  } catch (error) {
    next(error);
  }
}
