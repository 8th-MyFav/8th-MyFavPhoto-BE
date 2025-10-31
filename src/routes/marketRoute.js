import express from "express";
import {
  approveTrade,
  getOfferedTradesHistory,
  proposeTrade,
  rejectTrade,
} from "../controllers/tradeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const marketRouter = express.Router();

marketRouter.use("/trades", authMiddleware.verifyAccessToken);
// NOTE: 교환 제안 생성 api
marketRouter.post(
  "/trades/:cardId",
  authMiddleware.verifyOfferedCardAuth,
  proposeTrade
);
// NOTE: 교환 제시 목록 조회 api
marketRouter.get(
  "/trades/:cardId",
  authMiddleware.verifyCardAuth,
  getOfferedTradesHistory
);
// NOTE: 교환 제시 승인
marketRouter.patch("/trades/:tradeId/approve", approveTrade);
// NOTE: 교환 제시 거절
marketRouter.patch("/trades/:tradeId/reject", rejectTrade);

export default marketRouter;
