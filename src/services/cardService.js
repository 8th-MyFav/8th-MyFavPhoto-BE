import { Genre, Grade } from "@prisma/client";
import cardRepository from "../repositories/cardRepository.js";
import * as errors from "../utils/errors.js"; // NOTE: 일단 errors.메서드()로 사용. 필요시 변경

/**
 * 카드 생성
 * @param {number} userId - 사용자 ID
 * @param {object} cardData - 생성할 카드 데이터
 * @returns {Promise<object>} 생성된 카드 정보
 */
async function createCard(userId, cardData, url, key) {
  if (
    !cardData.name ||
    !cardData.grade ||
    !cardData.genre ||
    !cardData.price ||
    !cardData.total_issued
  ) {
    throw errors.invalidData();
  }

  const createdCard = await cardRepository.create(userId, cardData, url);
  return createdCard;
}

/**
 * 내 카드 목록 조회
 * @param {object} options - 조회 옵션
 * @param {number} options.userId - 사용자 ID
 * @param {number} options.page - 페이지 번호
 * @param {number} options.pageSize - 페이지 크기
 * @param {string} [options.grade] - 등급 필터
 * @param {string} [options.genre] - 장르 필터
 * @param {string} [options.keyword] - 키워드 검색
 * @param {boolean} [options.forSale] - 판매 등록 가능한 카드만 조회할지 여부
 * @returns {Promise<object>} 카드 목록 및 페이지 정보
 */
async function getMyCards({
  userId,
  page,
  pageSize,
  grade,
  genre,
  keyword,
  forSale,
}) {
  if (!userId) throw errors.unauthorized();

  // grade가 DB에 허용된 값인지
  if (grade && !Object.values(Grade).includes(grade))
    throw errors.invalidQuery();

  // genre가 존재하는 카테고리인지???
  if (genre && !Object.values(Genre).includes(genre))
    throw errors.invalidQuery();

  const myCards = await cardRepository.findByUserId({
    userId,
    page,
    pageSize,
    grade,
    genre,
    keyword,
    forSale,
  });
  return myCards;
}

/**
 * 내 카드 상세 정보 조회
 * @param {object} options - 조회 옵션
 * @param {number} options.userId - 사용자 ID
 * @param {number} options.cardId - 카드 ID
 * @returns {Promise<object>} 카드 상세 정보
 */
async function getMyCardDetail({ userId, cardId }) {
  if (!cardId) throw errors.invalidData("card id가 전달되지 않았습니다.");

  const myCardDetail = await cardRepository.findByCardId(cardId);
  if (!myCardDetail) throw errors.cardNotFound();
  if (myCardDetail.creator_id !== userId) throw errors.forbidden();
  return myCardDetail;
}

export default {
  createCard,
  getMyCards,
  getMyCardDetail,
};
