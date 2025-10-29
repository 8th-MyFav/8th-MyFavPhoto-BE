import express from "express";
import {
  getMe,
  getPoints,
  randomPoints,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

// 전체에 우선적으로 인가 진행
userRouter.use(authMiddleware.verifyAccessToken);

userRouter.get("/me", getMe);
userRouter.get("/points", getPoints);
userRouter.post("/points", randomPoints);

export default userRouter;
