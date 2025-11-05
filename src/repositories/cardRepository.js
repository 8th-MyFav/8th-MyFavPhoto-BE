import { Grade } from "@prisma/client";
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
 * @param {number} cardData.total_issued - 카드 총 발행량
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
 *   total_issued: 1,
 *   description: "카드 설명입니다.",
 *   image_url: "https://example.com/card.jpg"
 * }, 1);
 */
async function create(userId, cardData) {
  // tx: 트랜잭션 내에 사용하는 클라이언트 인스턴스
  const result = await prisma.$transaction(async (tx) => {
    // NOTE: Photocards 테이블에 데이터 추기
    const photocard = await tx.Photocards.create({
      data: {
        creator_id: userId,
        // NOTE: user_id vs userId는 middleware, controller, service 참고해서 변경할 것
        name: cardData.name,
        grade: cardData.grade,
        genre: cardData.genre,
        price: cardData.price,
        total_issued: cardData.total_issued,
        description: cardData.description,
        image_url: cardData.image_url,
      },
    });

    // NOTE: UserPhotocards 테이블에 데이터 추가
    const userPhotocards = await Promise.all(
      Array.from({ length: cardData.total_issued }).map(() =>
        tx.UserPhotocards.create({
          data: {
            owner_id: userId,
            photocards_id: photocard.id,
            is_sale: false,
          },
        })
      )
    );
    return { photocard, userPhotocards };
  });
  return result;
}

/**
 * 카드 정보 수정
 * @param {number} a 첫 번째 숫자
 * @param {number} b 두 번째 숫자
 * @returns {number} 두 숫자의 합
 */
async function update(cardId, updateData) {}

/**
 * 특정 유저의 포토카드 목록을 조회합니다.
 *
 * - 전체 카드 기준으로 등급별 개수(`gradeCounts`)와 총 개수(`totalCount`)를 계산하고,
 * - 필터가 적용된 카드 리스트(`lists`)를 페이지네이션하여 반환합니다.
 *
 * @param {Object} params                  - 조회 조건
 * @param {number} params.userId           - 유저 ID
 * @param {number} params.page             - 페이지 번호 (1부터 시작)
 * @param {number} params.pageSize         - 페이지당 항목 수
 * @param {string} [params.grade]          - 필터용 등급 (COMMON, RARE, SUPER_RARE, LEGENDARY)
 * @param {string} [params.genre]          - 필터용 장르 (KPOP, ACTOR, ESPORTS, KBO, ANIMATION)
 * @param {string} [params.keyword]        - 카드 이름 검색 키워드 (대소문자 무시)
 * @returns {Promise<{ totalCount: number, gradeCounts: Object, lists: Object[] }>}
 *          카드 총 개수, 등급별 개수 요약, 필터된 카드 목록을 포함한 객체
 */
async function findByUserId({
  userId,
  page = 1,
  pageSize = 15,
  grade,
  genre,
  keyword,
}) {
  // 필터 추가
  const baseWhere = { owner_id: userId, is_sale: true };
  const filteredWhere = {
    ...baseWhere,
    ...(grade && { grade }),
    ...(genre && { genre }),
    ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
  };

  // 전체 개수
  const totalCount = await prisma.userPhotocards.count({ where: baseWhere });

  // 등급 기본값 초기화 (groupBy 관계 필드 지원XX) -> join 수행, 각 userPC별 등급 접근 -> count
  const gradeCounts = Object.fromEntries(
    Object.values(Grade).map((grade) => [grade, 0])
  );

  // 등급별 개수 계산
  const gradeData = await prisma.userPhotocards.findMany({
    where: baseWhere,
    select: { photocard: { select: { grade: true } } },
  });
  gradeData.forEach(({ photocard }) => (gradeCounts[photocard.grade] += 1));

  const lists = await prisma.userPhotocards.findMany({
    where: filteredWhere,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      photocard: {
        select: {
          id: true,
          creator_id: true,
          grade: true,
          genre: true,
          price: true,
          total_issued: true,
          image_url: true,
        },
      },
    },
  });
  const formattedList = lists.map((item) => ({
    id: item.photocard.id,
    creator_id: item.photocard.creator_id,
    name: item.photocard.name,
    grade: item.photocard.grade,
    genre: item.photocard.genre,
    price: item.photocard.price,
    total_issued: item.photocard.total_issued,
    count: 1, // 유저 보유카드 기준이라 기본 1
    image_url: item.photocard.image_url,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  return {
    totalCount,
    grade: gradeCounts,
    lists: formattedList,
  };
}

/**
 * 특정 카드 조회
 * @param {Object} params
 * @param {number} params.cardId
 * @returns {Promise<Object|null>}
 */

async function findByCardId(cardId) {
  const cardDetail = await prisma.photocards.findUnique({
    where: { id: cardId },
  });
  return cardDetail;
}

async function findCardByCardId({ tx, cardId }) {
  return tx.photocards.findUnique({
    where: { id: cardId },
  });
}

export default {
  create,
  update,
  findByUserId,
  findByCardId,
  findCardByCardId,
};

// 승인/거절 => 테이블
// 마켓 카드 구매하기
