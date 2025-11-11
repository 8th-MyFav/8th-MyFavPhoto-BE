import { Grade } from "@prisma/client";
import prisma from "../config/prisma.js";

/**
 * 카드 생성
 * @param {number} userId - 사용자 ID
 * @param {object} cardData - 생성할 카드 데이터
 * @returns {Promise<object>} 생성된 카드 정보
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
async function findByUserId({
  userId,
  page = 1,
  pageSize = 18,
  grade,
  genre,
  keyword,
  forSale,
}) {
  // 필터 추가
  // 마이갤러리는 카드 소유자가 나인 카드
  // 판매 올릴 카드 목록은 카드 생성자도, 현재 소유자도 나고 판매 올리지도 않은 카드
  const galleryWhere = {
    userPhotocards: {
      some: {
        owner_id: userId,
      },
    },
  };
  const where = {
    ...galleryWhere,
    ...(grade && { grade }),
    ...(genre && { genre }),
    ...(forSale && {
      creator_id: userId,
      userPhotocards: { some: { trade_info_id: null } },
    }),
    ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
  };

  // 3개의 DB 요청을 병렬 처리 (데이터 정합성용)
  const [totalCount, gradeGroups, lists] = await prisma.$transaction([
    // 1. 필터링된 전체 개수 조회
    prisma.photocards.count({
      where: galleryWhere,
    }),

    // 2. 등급별 개수 조회 (DB에서 직접 그룹화)
    prisma.photocards.groupBy({
      by: ["grade"],
      where: galleryWhere,
      _count: {
        grade: true,
      },
    }),

    // 3. 목록 조회
    prisma.photocards.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          // 데이터 개수 세기
          select: {
            userPhotocards: {
              // userPhotocards 관계 데이터
              where: {
                owner_id: userId,
                ...(forSale && { trade_info_id: null }),
              },
            },
          },
        },
      },
    }),
  ]);

  // 등급별 개수 포맷팅
  const gradeCounts = Object.fromEntries(
    Object.values(Grade).map((grade) => [grade, 0])
  );
  gradeGroups.forEach((group) => {
    gradeCounts[group.grade] = group._count.grade;
  });

  const formattedList = lists.map((item) => ({
    id: item.id,
    creator_id: item.creator_id,
    name: item.name,
    grade: item.grade,
    genre: item.genre,
    price: item.price,
    // total_issued: item.total_issued,
    count: item._count.userPhotocards, // 사용자가 보유한 실제 카드 수량
    image_url: item.image_url,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return {
    totalCount,
    totalGrades: gradeCounts,
    lists: formattedList,
  };
}

/**
 * 카드 ID로 카드 조회
 * @param {number} cardId - 카드 ID
 * @returns {Promise<object|null>} 조회된 카드 정보
 */
async function findByCardId(cardId) {
  const cardDetail = await prisma.photocards.findUnique({
    where: { id: cardId },
  });
  return cardDetail;
}

/**
 * 카드 ID로 카드 조회 (트랜잭션용)
 * @param {object} options - 조회 옵션
 * @param {object} options.tx - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 카드 ID
 * @returns {Promise<object|null>} 조회된 카드 정보
 */
async function findCardByCardId({ tx, cardId }) {
  return tx.photocards.findUnique({
    where: { id: cardId },
  });
}

export default {
  create,
  findByUserId,
  findByCardId,
  findCardByCardId,
};
