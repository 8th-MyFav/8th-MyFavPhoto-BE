import prisma from "../config/prisma.js";

/* create listing */

// NOTE: userPhotocards 조회
async function findByCardId({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
  });
}

// NOTE: 판매할 userPhotocards Id 조회 + 개수제한
async function findAvailable({ tx = prisma, cardId, total_count }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: false },
    select: { id: true },
    take: total_count,
  });
}

// NOTE: 거래 포스트 생성
async function createTradePost({
  tx = prisma,
  trade_grade,
  trade_genre,
  trade_note,
}) {
  return tx.tradePosts.create({
    data: {
      trade_grade,
      trade_genre,
      trade_note,
    },
  });
}

// NOTE: userPhotocards 판매 상태 변경 + 거래글과 연결
async function linkTradeInfo({ tx = prisma, ids, trade_info_id }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: true, trade_info_id },
  });
}

// NOTE: userPhotocards 판매 상태 false
async function resetSaleStatus({ tx = prisma, ids }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: false },
  });
}

/* update listing */

// NOTE: photocards 개수 세기
async function countByCardId({ tx = prisma, cardId }) {
  return tx.photocards.count({ where: { id: cardId } });
}

// NOTE: 특정 userPhotocards 조회
async function findUserPhotocardsByCardId({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
    orderBy: { id: "asc" },
    select: { id: true, is_sale: true },
  });
}

// NOTE: 특정 userPhotocards 판매 상태 true
async function setSaleStatus({ tx = prisma, ids }) {
  return tx.userPhotocards.updateMany({
    where: { id: { in: ids } },
    data: { is_sale: true },
  });
}

// NOTE: photocards 테이블 가격 수정 (genre, grade 고정)
async function updatePhotocard({ tx = prisma, cardId, price }) {
  return tx.photocards.update({
    where: { id: cardId },
    data: { price },
  });
}

// NOTE: trade post id 조회 (userPhotocards 경유)
async function findTradePostIdByCardId({ tx = prisma, cardId }) {
  const result = await tx.userPhotocards.findFirst({
    where: { photocards_id: cardId, is_sale: true },
    select: {
      tradePost: { select: { id: true } },
    },
  });
  return result?.tradePost?.id ?? null;
}

// NOTE: trade post 수정
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

/* delete listing */

async function findStatusTrue({ tx = prisma, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: true },
    select: { id: true },
  });
}

async function deleteTradePost({ tx = prisma, tradePostId }) {
  return tx.tradePosts.delete({
    where: { id: tradePostId },
  });
}

/* get market listings */
async function findAll({ where, take, cursor, orderBy }) {
  return prisma.tradePosts.findMany({
    where,
    take, // 기준점 이후 개수 제한 반환
    cursor: cursor ? { id: cursor } : undefined, // 기준점 기준: id
    skip: cursor ? 1 : 0, // 기준점 있으면 제외, 없으면 포함
    orderBy,
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
              price: true,
              image_url: true,
              creator: { select: { nickname: true } }, // user join
            },
          },
        },
      },
    },
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
  updatePhotocard,
  findTradePostIdByCardId,
  updateTradePost,
  findStatusTrue,
  deleteTradePost,
  findAll,
};
