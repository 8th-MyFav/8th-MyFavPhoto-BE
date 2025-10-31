import { expressjwt } from "express-jwt";
import notificationRepository from "../repositories/notificationRepository.js";
import cardRepository from "../repositories/cardRepository.js";
import * as errors from "../utils/errors.js";
import userCardRepository from "../repositories/userCardRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Authorization Header 에 Bearer {token} 형식으로 요청왔을 때 토큰 검증
const verifyAccessToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"], // default 알고리즘
});

// cookie로 전달된 refreshToekn 검증
const verifyRefreshToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => req.cookies.refreshToken,
});

// params로 들어온 카드가 현재 유저 카드인지 확인 -> 판매 올리기, 판매 내리기 등
async function verifyCardAuth(req, res, next) {
  const { userId } = req.auth;
  const { cardId } = req.params;
  try {
    // 일단 카드 id로 photocards id 구하기
    const userCard = await userCardRepository.findById(Number(cardId));
    
    if(!userCard) throw errors.cardNotFound();
    // -> photocards id로 creator id 구하기
    const cardInfo = await cardRepository.findByCardId(userCard.photocards_id);

    // 카드 creator랑 현재 auth 가 동일한지 확인
    if (cardInfo.creator_id !== userId) throw errors.forbidden("해당 카드의 생성자가 아닙니다.");

    next();
  } catch (error) {
    return next(error);
  }
}
// body로 들어온 offered Card가 현재 유저 카드인지 확인 -> trade 제안에만 사용?
async function verifyOfferedCardAuth(req, res, next) {
  const { userId } = req.auth;
  const { offeredCardId: cardId } = req.body;
  try {
    // 일단 카드 id로 카드 정보에서 creator id 가져오기
    const userCard = await userCardRepository.findById(Number(cardId));
    if(!userCard) throw errors.cardNotFound();
    
    const cardInfo = await cardRepository.findByCardId(userCard.photocards_id);

    // 카드 creator랑 현재 auth 가 동일한지 확인
    if (cardInfo.creator_id !== userId) throw errors.forbidden("제안한 카드의 생성자가 아닙니다.");

    next();
  } catch (error) {
    return next(error);
  }
}

// 알림 유저 확인
async function verifyNotifAuth(req, res, next) {
  const { userId } = req.auth;
  const { id } = req.params;
  try {
    const notif = await notificationRepository.findById(Number(id));
    if (!notif) {
      const error = new Error("알림이 없습니다.");
      error.code = 404;
      throw error;
    }

    if (notif.receiver_id !== userId) {
      const error = new Error("권한이 없는 사용자입니다.");
      error.code = 403;
      throw error;
    }
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
  verifyCardAuth,
  verifyOfferedCardAuth,
  verifyNotifAuth,
};
