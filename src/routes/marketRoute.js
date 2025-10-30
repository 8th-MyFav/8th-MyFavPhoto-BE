import express from "express";
import {
  getOfferedTradesHistory,
  proposeTrade,
} from "../controllers/tradeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const marketRouter = express.Router();

// NOTE: 교환 제안 생성 api
marketRouter.post(
  "/trades/:cardId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyOfferedCardAuth,
  proposeTrade
);
// NOTE: 교환 제시 목록 조회 api
marketRouter.get(
  "/trades/:cardId",
  authMiddleware.verifyAccessToken,
  authMiddleware.verifyCardAuth,
  getOfferedTradesHistory
);


export default marketRouter;
