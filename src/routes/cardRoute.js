import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createCard,
  getMyCardDetail,
  getMyCards,
} from "../controllers/cardController.js";
import { upload } from "../middlewares/multer.js";

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

// NOTE: 카드 생성하기
cardRouter.post(
  "/",
  authMiddleware.verifyAccessToken,
  upload.single("file"), // 파일 multer
  createCard
);

// NOTE: 마이 갤러리 목록, 판매 올릴 내 카드 목록 조회
cardRouter.get("/me", authMiddleware.verifyAccessToken, getMyCards);

// NOTE: 판매 올릴 내 카드 상세
cardRouter.get("/:cardId", authMiddleware.verifyAccessToken, getMyCardDetail);

export default cardRouter;
