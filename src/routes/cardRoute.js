import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createCard } from "../controllers/cardController.js";

/**
 * 카드 관련 라우터
 *
 * @module routes/cardRoute
 * @description 포토카드 생성, 수정, 삭제 등의 엔드포인트를 정의합니다.
 *
 * @requires express
 * @requires middlewares/authMiddleware
 * @requires controllers/cardController
 *
 * @route POST /cards
 * @summary 새 포토카드를 생성합니다.
 * @security AccessToken
 * @middleware verifyAccessToken - 로그인 인증 미들웨어
 * @controller createCard - 카드 생성 컨트롤러
 */

const cardRouter = express.Router();

cardRouter.post("/", authMiddleware.verifyAccessToken, createCard);

export default cardRouter;
