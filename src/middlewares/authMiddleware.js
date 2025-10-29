import { expressjwt } from "express-jwt";
import notificationRepository from "../repositories/notificationRepository.js";

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
  verifyNotifAuth,
};
