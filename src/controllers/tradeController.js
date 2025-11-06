import tradeService from "../services/tradeService.js";
import * as errors from "../utils/errors.js";
import validate from "../utils/validate.js";

// NOTE: 교환 제안
export async function proposeTrade(req, res, next) {
  try {
    const { userId } = req.auth;
    const { content } = req.body;
    const tradePostId = Number(req.body.tradePostId);
    const offeredCardId = Number(req.body.offeredCardId);

    // query, body 유효성 검사
    if (!Number.isInteger(tradePostId) || !Number.isInteger(offeredCardId))
      throw errors.invalidQuery();

    const trades = await tradeService.createTrade(
      Number(userId),
      tradePostId,
      offeredCardId,
      content
    );

    return res.status(201).json(trades);
  } catch (error) {
    next(error);
  }
}

// NOTE: 교환 제시 목록 조회
export async function getOfferedTradesHistory(req, res, next) {
  try {
    const cardId = Number(req.params.cardId);

    // query 유효성 검사
    if (!Number.isInteger(cardId)) throw errors.invalidQuery();

    const trades = await tradeService.getTradesHistory(cardId);

    return res.status(200).json(trades);
  } catch (error) {
    next(error);
  }
}

// NOTE: 교환 제시 승인
export async function approveTrade(req, res, next) {
  try {
    const userId = Number(req.auth.userId);
    const tradeId = Number(req.params.tradeId);

    // query 유효성 검사
    if (!Number.isInteger(tradeId)) throw errors.invalidQuery();

    const tradeHistory = await tradeService.patchTradeApprove(tradeId, userId);

    return res.status(201).json(tradeHistory);
  } catch (error) {
    next(error);
  }
}

// NOTE: 교한 제시 거절
export async function rejectTrade(req, res, next) {
  try {
    const tradeId = Number(req.params.tradeId);

    // query 유효성 검사
    if (!Number.isInteger(tradeId)) throw errors.invalidQuery();

    const tradeHistory = await tradeService.patchTradeReject(tradeId);

    return res.status(201).json(tradeHistory);
  } catch (error) {
    next(error);
  }
}
