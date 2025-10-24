import { expressjwt } from "express-jwt";

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

export default {
  verifyAccessToken,
  verifyRefreshToken,
};
