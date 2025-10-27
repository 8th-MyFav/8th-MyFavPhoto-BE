import express from "express";
import { getMe, getPoints } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// 전체에 우선적으로 인가 진행
userRouter.use(authMiddleware.verifyAccessToken);

userRouter.get("/me", getMe);
userRouter.get("/points", getPoints);
// user 만들때 points 테이블도 자동으로 생성 추가

export default userRouter;
