import express from "express";
import cardService from "../services/cardService.js";

/**
 * 카드 생성 컨트롤러
 *
 * @route POST /cards
 * @description 로그인된 사용자가 새로운 포토카드를 생성합니다.
 *              Controller에서는 HTTP 요청 레벨 검증(빈 body 체크 등)을 수행하고,
 *              Service 레이어로 실제 생성 로직을 전달합니다.
 *
 * @param {Request} req - Express 요청 객체
 * @param {Object} req.user - 인증 미들웨어에서 주입된 로그인 사용자 정보
 * @param {number} req.user.id - 사용자 ID
 * @param {Object} req.body - 카드 생성 정보
 * @param {string} req.body.name - 카드 이름
 * @param {string} req.body.grade - 카드 등급 (COMMON, RARE, SUPER_RARE, LEGENDARY)
 * @param {string} req.body.genre - 카드 장르 (KPOP, ACTOR, ESPORTS, KBO, ANIMATION)
 * @param {number} req.body.price - 카드 가격
 * @param {number} req.body.total_count - 카드 총 수량
 * @param {string} [req.body.description] - 카드 설명
 * @param {string} [req.body.image_url] - 카드 이미지 URL
 * @param {Response} res - Express 응답 객체
 * @param {NextFunction} next - Express next 함수 (에러 핸들링용)
 *
 * @returns {JSON} 생성된 포토카드 정보
 *
 * @throws {Error} - req.body가 비어있으면 400 에러
 * @throws {Error} - Service 레이어에서 발생한 에러는 next(error)로 전달
 */

export async function createCard(req, res, next) {
  try {
    const { userId } = req.auth;
    const cardData = req.body;
    //NOTE: 일반적으로 user 객체 구조는 팀마다 diff => req.user.id가 맞는지(or req.user.userId인지) 확인 필요
    if (!cardData || Object.keys(cardData).length === 0) {
      return res.status(400).json({ message: "body가 비어있습니다." });
    }
    const card = await cardService.createCard(userId, cardData);
    return res.status(201).json(card);
  } catch (error) {
    next(error);
  }
}
