import cardRepository from "../repositories/cardRepository.js";

/**
 * 카드 생성 Service
 *
 * @param {number} userId - 카드 생성 요청을 한 사용자 ID
 * @param {Object} cardData - 카드 생성 정보
 * @param {string} cardData.name - 카드 이름
 * @param {string} cardData.grade - 카드 등급 (COMMON, RARE, SUPER_RARE, LEGENDARY)
 * @param {string} cardData.genre - 카드 장르 (KPOP, ACTOR, ESPORTS 등)
 * @param {number} cardData.price - 카드 가격
 * @param {number} cardData.total_count - 카드 총 수량
 * @param {string} [cardData.description] - 카드 설명
 * @param {string} [cardData.image_url] - 카드 이미지 URL
 *
 * @throws {Error} - userId가 없을 경우 UNAUTHORIZED 에러
 * @throws {Error} - 필수 필드 누락 시 INVALID_DATA 에러
 *
 * @returns {Promise<Object>} - 생성된 photocard와 userPhotocard 정보
 * TODO: 필드의 타입/범위까지 체크할 것
 */
async function createCard(userId, cardData) {
  if (!userId) {
    const error = new Error("UNAUTHORIZED"); 
    error.code = 401;
    error.data = {
      errorCode: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
    };
    throw error;
  }
  if (
    !cardData.name ||
    !cardData.grade ||
    !cardData.genre ||
    !cardData.price ||
    !cardData.total_count
  ) {
    const error = new Error("INVALID_DATA");
    error.code = 422;
    error.data = {
      errorCode: "INVALID_DATA",
      message: "필수 필드 누락 또는 유효하지 않은 값입니다.",
    };
    throw error;
    // NOTE: next()는 controller, middleware 내부. service, repository 내부는 throw error
  }

  const createdCard = await cardRepository.create(userId, cardData);
  return createdCard;
}

export default { createCard };
