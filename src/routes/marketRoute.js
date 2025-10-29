import express from "express";
import { proposeTrade } from "../controllers/tradeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const marketRouter = express.Router();

// NOTE: 교환 api
marketRouter.post(
  "/trades/:cardId",
  authMiddleware.verifyAccessToken,
  proposeTrade
);

marketRouter.get(
  "/trades/:cardId",
  authMiddleware.verifyAccessToken,
  
);

export default marketRouter;
