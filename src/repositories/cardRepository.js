import prisma from "../config/prisma.js";

/**
 * DB에서 카드를 다루는 가장 하위 레벨
 * @태그 타입 이름 설명
 */

/**
 * 새로운 포토카드를 생성합니다.
 * 이 함수는 photocards 테이블과 user_photocards 테이블 모두에 데이터를 추가합니다.
 *
 * @async
 * @function createCard
 * @param {Object} cardData - 생성할 카드 정보 (req.body에서 전달됨)
 * @param {string} cardData.name - 포토카드 이름
 * @param {string} cardData.grade - 포토카드 등급 (예: "RARE", "COMMON")
 * @param {string} cardData.genre - 포토카드 장르 (예: "KPOP", "ANIME")
 * @param {number} cardData.price - 카드 판매 가격
 * @param {number} cardData.total_count - 카드 총 개수
 * @param {string} cardData.description - 카드 설명
 * @param {string} cardData.image_url - 카드 이미지 URL
 * @param {number} userId - 현재 로그인한 유저의 ID (owner_id로 사용됨)
 * @returns {Promise<Object>} 생성된 카드 정보 객체
 * @throws {Error} 카드 생성 중 에러 발생 시 예외를 던집니다.
 *
 * @example
 * const newCard = await createCard({
 *   name: "BTS RM",
 *   grade: "RARE",
 *   genre: "KPOP",
 *   price: 10,
 *   total_count: 1,
 *   description: "카드 설명입니다.",
 *   image_url: "https://example.com/card.jpg"
 * }, 1);
 */

async function create(userId, cardData) {
  // tx: 트랜잭션 내에 사용하는 클라이언트 인스턴스
  const result = await prisma.$transaction(async (tx) => {
    // NOTE: photocard 테이블에 데이터를 추가함
    const photocard = await tx.Photocards.create({
      data: {
        creator_id: userId,
        // NOTE: user_id vs userId는 middleware, controller, service 참고해서 변경할 것
        name: cardData.name,
        grade: cardData.grade,
        genre: cardData.genre,
        price: cardData.price,
        total_count: cardData.total_count,
        description: cardData.description,
        image_url: cardData.image_url,
      },
    });

    // NOTE: userPhotocard 테이블에 만들어진 photocard의 id와 생성자 id 외 데이터를 추가
    const trade_info_id = undefined;

    const userPhotocardData = {
      owner_id: userId,
      photocards_id: photocard.id,
      // trade_info_id,
      is_sale: false,
    };

    if (trade_info_id !== undefined) {
      userPhotocardData.trade_info_id = trade_info_id;
    }

    const userPhotocard = await tx.UserPhotocards.create({
      data: userPhotocardData,
    });
    return { photocard, userPhotocard };
  });
  return result;
}

/**
 * 카드 단건 조회
 * @param {number} a 첫 번째 숫자
 * @param {number} b 두 번째 숫자
 * @returns {number} 두 숫자의 합
 */
async function findById(cardId) {}

/**
 * 카드 정보 수정
 * @param {number} a 첫 번째 숫자
 * @param {number} b 두 번째 숫자
 * @returns {number} 두 숫자의 합
 */
async function update(cardId, updateData) {}

/**
 * 내 카드 목록 조회
 * @param {number} a 첫 번째 숫자
 * @param {number} b 두 번째 숫자
 * @returns {number} 두 숫자의 합
 */
async function findByUserId(userId) {}

export default {
  create,
  findById,
  update,
  findByUserId,
};
