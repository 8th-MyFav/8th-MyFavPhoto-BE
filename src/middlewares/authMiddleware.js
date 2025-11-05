import { expressjwt } from "express-jwt";
import notificationRepository from "../repositories/notificationRepository.js";
import cardRepository from "../repositories/cardRepository.js";
import * as errors from "../utils/errors.js";
import userCardRepository from "../repositories/userCardRepository.js";
import tradeRepository from "../repositories/tradeRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// NOTE: accessToken 검증
// Authorization Header 에 Bearer {token} 형식으로 요청왔을 때 토큰 검증
const verifyAccessToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"], // default 알고리즘
});

// NOTE: refreshToken 검증
// cookie로 전달된 refreshToekn 검증
const verifyRefreshToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => req.cookies.refreshToken,
});

// body로 들어온 카드가 현재 유저 카드인지 확인 -> 판매 올리기
async function verifyBodyCardAuth(req, res, next) {
  const { userId } = req.auth;
  const cardId = Number(req.body.cardId);
  try {
    // 카드 id 유효성 검사
    if (!cardId || isNaN(cardId))
      throw errors.badRequest("유효한 카드 ID가 아닙니다.");

    // 카드 존재 여부 조회
    const userCard = await cardRepository.findByCardId(Number(cardId));
    if (!userCard) throw errors.notFound("존재하지 않는 카드입니다.");

    // 카드 생성자 검증
    if (userCard.creator_id !== userId)
      throw errors.forbidden("해당 카드의 생성자가 아닙니다.");

    next();
  } catch (error) {
    return next(error);
  }
}

// params로 들어온 카드가 현재 유저 카드인지 확인 -> 판매 수정하기, 판매 내리기 등
async function verifyParamsCardAuth(req, res, next) {
  const { userId } = req.auth;
  const cardId = Number(req.params.cardId);
  try {
    // 카드 id로 photocards 구하기
    const photocard = await cardRepository.findByCardId(cardId);

    if (!photocard) throw errors.cardNotFound("카드가 없습니다.");

    // 카드 creator랑 현재 auth 가 동일한지 확인
    if (photocard.creator_id !== userId)
      throw errors.forbidden("해당 카드의 생성자가 아닙니다.");

    next();
  } catch (error) {
    return next(error);
  }
}

// NOTE: offeredCardId가 현재 유저의 카드인가?
// body로 들어온 offered Card가 현재 유저 카드인지 확인 -> trade 제안에만 사용?
async function verifyOfferedCardAuth(req, res, next) {
  const { userId } = req.auth;
  const cardId = Number(req.body.offeredCardId);
  try {
    // 카드 id 유효성 검사
    if (!cardId || isNaN(cardId))
      throw errors.badRequest("유효한 카드 ID가 아닙니다.");

    // 카드 id로 카드 정보에서 creator id 가져오기
    const photocard = await cardRepository.findByCardId(cardId);
    if (!photocard) throw errors.cardNotFound();

    // 카드 creator랑 현재 auth 가 동일한지 확인
    if (photocard.creator_id !== userId)
      throw errors.forbidden("제안한 카드의 생성자가 아닙니다.");

    next();
  } catch (error) {
    return next(error);
  }
}

// NOTE: 교환 history를 변경할 수 있는가?
async function verifyTradeAuth(req, res, next) {
  const { userId } = req.auth;
  const { tradeId } = req.params;
  try {
    const tradeHistory = await tradeRepository.findById(Number(tradeId));

    if (!tradeHistory) throw errors.tradeNotFound("교환 제안이 없습니다.");

    // 카드 소유자와 현재 유저 확인
    const userCard = await userCardRepository.findById(
      tradeHistory.target_card_id
    );
    if (userCard.owner_id !== Number(userId)) throw errors.forbidden();

    next();
  } catch (error) {
    return next(error);
  }
}

// NOTE: 알림을 받는 유저인가?
// 알림 유저 확인
async function verifyNotifAuth(req, res, next) {
  const { userId } = req.auth;
  const { id } = req.params;
  try {
    const notif = await notificationRepository.findById(Number(id));
    if (!notif) throw errors.notificationNotFound("알림이 없습니다.");

    if (notif.receiver_id !== userId) throw errors.forbidden();
    // 인증 성공 시 다음 미들웨어로 이동
    next();
  } catch (error) {
    // 에러 발생 시 에러 핸들러로 전파
    return next(error);
  }
}

export default {
  verifyAccessToken,
  verifyRefreshToken,
  verifyBodyCardAuth,
  verifyParamsCardAuth,
  verifyOfferedCardAuth,
  verifyTradeAuth,
  verifyNotifAuth,
};
