import prisma from "../config/prisma.js";

/**
 * 카드 ID로 userPhotocards 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @returns {Promise<object[]>}
 */
async function findByCardId({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
  });
}

/**
 * 판매 가능한 userPhotocards 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @param {number} options.total_count - 조회할 개수
 * @returns {Promise<object[]>}
 */
async function findAvailable({ tx = prisma, cardId, total_count }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: false },
    select: { id: true },
    take: total_count,
  });
}

/**
 * 거래 포스트 생성
 * @param {object} options - 생성 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {string} options.trade_grade - 교환 희망 등급
 * @param {string} options.trade_genre - 교환 희망 장르
 * @param {string} options.trade_note - 교환 희망 노트
 * @param {number} options.price - 가격
 * @param {number} options.total_count - 총 수량
 * @returns {Promise<object>}
 */
async function createTradePost({
  tx = prisma,
  trade_grade,
  trade_genre,
  trade_note,
  price,
  total_count,
}) {
  return tx.tradePosts.create({
    data: {
      trade_grade,
      trade_genre,
      trade_note,
      price,
      total_count,
    },
  });
}

/**
 * userPhotocards의 판매 상태를 true로 변경하고 거래 정보 ID를 연결
 * @param {object} options - 업데이트 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number[]} options.ids - userPhotocard ID 배열
 * @param {number} options.trade_info_id - 거래 정보 ID
 * @returns {Promise<object>}
 */
async function linkTradeInfo({ tx = prisma, ids, trade_info_id }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: true, trade_info_id },
  });
}

/**
 * userPhotocards의 판매 상태를 false로 변경
 * @param {object} options - 업데이트 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number[]} options.ids - userPhotocard ID 배열
 * @returns {Promise<object>}
 */
async function resetSaleStatus({ tx = prisma, ids }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: false },
  });
}

/**
 * 카드 ID로 photocards 개수 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @returns {Promise<number>}
 */
async function countByCardId({ tx = prisma, cardId }) {
  return tx.photocards.count({ where: { id: cardId } });
}

/**
 * 카드 ID로 특정 userPhotocards 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @returns {Promise<object[]>}
 */
async function findUserPhotocardsByCardId({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
    orderBy: { id: "asc" },
    select: { id: true, is_sale: true },
  });
}

/**
 * 특정 userPhotocards의 판매 상태를 true로 변경
 * @param {object} options - 업데이트 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number[]} options.ids - userPhotocard ID 배열
 * @returns {Promise<object>}
 */
async function setSaleStatus({ tx = prisma, ids }) {
  return tx.userPhotocards.updateMany({
    where: { id: { in: ids } },
    data: { is_sale: true },
  });
}

/**
 * tradePosts 테이블의 가격 수정
 * @param {object} options - 업데이트 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.tradePostId - 거래 포스트 ID
 * @param {number} options.price - 수정할 가격
 * @returns {Promise<object>}
 */
async function updateTradePrice({ tx = prisma, tradePostId, price }) {
  return tx.tradePosts.update({
    where: { id: tradePostId },
    data: { price },
  });
}

/**
 * 카드 ID를 통해 trade post ID 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @returns {Promise<number|null>}
 */
async function findTradePostIdByCardId({ tx = prisma, cardId }) {
  const result = await tx.userPhotocards.findFirst({
    where: { photocards_id: cardId, is_sale: true },
    select: {
      tradePost: { select: { id: true } },
    },
  });
  return result?.tradePost?.id ?? null;
}

/**
 * trade post 수정
 * @param {object} options - 업데이트 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.id - 거래 포스트 ID
 * @param {string} [options.trade_grade] - 교환 희망 등급
 * @param {string} [options.trade_genre] - 교환 희망 장르
 * @param {string} [options.trade_note] - 교환 희망 노트
 * @returns {Promise<object>}
 */
async function updateTradePost({
  tx = prisma,
  id,
  trade_grade,
  trade_genre,
  trade_note,
}) {
  return tx.tradePosts.update({
    where: { id },
    data: {
      trade_grade,
      trade_genre,
      trade_note,
    },
  });
}

/**
 * 판매 중인 userPhotocards 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.cardId - 포토카드 ID
 * @returns {Promise<object[]>}
 */
async function findStatusTrue({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: true },
    select: { id: true },
  });
}

/**
 * 거래 포스트 삭제
 * @param {object} options - 삭제 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.tradePostId - 거래 포스트 ID
 * @returns {Promise<object>}
 */
async function deleteTradePost({ tx = prisma, tradePostId }) {
  return tx.tradePosts.delete({
    where: { id: tradePostId },
  });
}

/**
 * 모든 거래 포스트 목록 조회 (마켓)
 * @param {object} options - 조회 옵션
 * @param {object} options.where - Prisma where 절
 * @param {number} options.take - 조회할 개수
 * @param {number} [options.cursor] - 커서 ID
 * @param {object} options.orderBy - Prisma orderBy 절
 * @returns {Promise<object[]>}
 */
async function findAll({ where, take, cursor, orderBy }) {
  return prisma.tradePosts.findMany({
    where,
    take, // 기준점 이후 개수 제한 반환
    cursor: cursor ? { id: cursor } : undefined, // 기준점 기준: id
    skip: cursor ? 1 : 0, // 기준점 있으면 제외, 없으면 포함
    orderBy, // QUES: 이 orderBy가 findAll 함수 외부에서 동적으로 결정될 일이 뭐가 있지..?
    include: {
      // userPhotocards join
      UserPhotocards: {
        select: {
          id: true,
          is_sale: true,
          // photocards join
          photocard: {
            select: {
              name: true,
              grade: true,
              genre: true,
              image_url: true,
              creator: { select: { nickname: true } }, // user join
            },
          },
        },
      },
    },
  });
}

/**
 * 포스트 ID로 거래 포스트 상세 정보 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.postId - 포스트 ID
 * @returns {Promise<object|null>}
 */
async function findByPostId({ tx = prisma, postId }) {
  return tx.tradePosts.findUnique({
    where: { id: postId },
    include: {
      UserPhotocards: {
        where: { is_sale: true },
        take: 1,
        select: {
          photocard: {
            select: {
              id: true,
              name: true,
              grade: true,
              genre: true,
              image_url: true,
              description: true,
              createdAt: true,
              updatedAt: true,
              creator: { select: { nickname: true } },
            },
          },
        },
      },
    },
  });
}

/**
 * 포스트 ID로 판매된 카드 개수 조회
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.postId - 포스트 ID
 * @returns {Promise<number>}
 */
async function countSoldByPostId({ tx = prisma, postId }) {
  return tx.userPhotocards.count({
    where: { trade_info_id: postId, is_sale: false },
  });
}

/**
 * 사용자 ID로 userPhotocards 목록 조회 (내 판매/교환 내역)
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {object} options.where - Prisma where 절
 * @param {number} options.page - 페이지 번호
 * @param {number} options.pageSize - 페이지 크기
 * @returns {Promise<object[]>}
 */
async function findUserPhotocardsByUserId({
  tx = prisma,
  where,
  page,
  pageSize,
}) {
  return tx.userPhotocards.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      photocard: true,
    },
  });
}

/**
 * 요청자 ID로 TradeHistories 조회하여 offered_card_id 배열 반환
 * @param {object} options - 조회 옵션
 * @param {object} [options.tx=prisma] - Prisma 트랜잭션 클라이언트
 * @param {number} options.requester_id - 요청자 ID
 * @returns {Promise<object[]>}
 */
async function findTradeHistoriesByRequesterId({ tx = prisma, requester_id }) {
  return tx.tradeHistories.findMany({
    where: { requester_id, trade_status: "PENDING" },
    select: { offered_card_id: true },
  });
}

export default {
  findByCardId,
  findAvailable,
  createTradePost,
  linkTradeInfo,
  resetSaleStatus,
  countByCardId,
  findUserPhotocardsByCardId,
  setSaleStatus,
  updateTradePrice,
  findTradePostIdByCardId,
  updateTradePost,
  findStatusTrue,
  deleteTradePost,
  findAll,
  findByPostId,
  countSoldByPostId,
  findTradeHistoriesByRequesterId,
  findUserPhotocardsByUserId,
};
