import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 토큰 검증 미들웨어
export function authenticateToken(req, res, next) {}
