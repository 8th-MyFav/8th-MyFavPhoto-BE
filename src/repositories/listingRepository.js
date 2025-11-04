import prisma from "../config/prisma.js";

/* create listing */

// NOTE: userPhotocards 조회
async function findByCardId({ tx, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
  });
}

// NOTE: 판매할 userPhotocards Id 조회 + 개수제한
async function findAvailable({ tx, cardId, total_count }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: false },
    select: { id: true },
    take: total_count,
  });
}

// NOTE: 거래 포스트 생성
async function createTradePost({ tx, trade_grade, trade_genre, trade_note }) {
  return tx.tradePosts.create({
    data: {
      trade_grade,
      trade_genre,
      trade_note,
    },
  });
}

// NOTE: userPhotocards 판매 상태 변경 + 거래글과 연결
async function linkTradeInfo({ tx, ids, trade_info_id }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: true, trade_info_id },
  });
}

// NOTE: userPhotocards 판매 상태 false
async function resetSaleStatus({ tx, ids }) {
  return tx.userPhotocards.updateMany({
    where: {
      id: { in: ids },
    },
    data: { is_sale: false },
  });
}

/* update listing */

// NOTE: photocards 개수 세기
async function countByCardId({ tx, cardId }) {
  return tx.photocards.count({ where: { id: cardId } });
}

// NOTE: 특정 userPhotocards 조회
async function findUserPhotocardsByCardId({ tx, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId },
    orderBy: { id: "asc" },
    select: { id: true, is_sale: true },
  });
}

// NOTE: 특정 userPhotocards 판매 상태 true
async function setSaleStatus({ tx, ids }) {
  return tx.userPhotocards.updateMany({
    where: { id: { in: ids } },
    data: { is_sale: true },
  });
}

// NOTE: photocards 테이블 가격 수정 (genre, grade 고정)
async function updatePhotocard({ tx, cardId, price }) {
  return tx.photocards.update({
    where: { id: cardId },
    data: { price },
  });
}

// NOTE: trade post id 조회 (userPhotocards 경유)
async function findTradePostIdByCardId({ tx, cardId }) {
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
  tx,
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

async function findStatusTrue({ tx, cardId }) {
  return tx.userPhotocards.findMany({
    where: { photocards_id: cardId, is_sale: true },
    select: { id: true },
  });
}

async function deleteTradePost({ tx, tradePostId }) {
  return tx.tradePosts.delete({
    where: { id: tradePostId },
  });
}

/* get market listings */

async function findAll({ orderBy, take, grade, genre, isSoldOut, keyword }) {
  return prisma.tradePosts.findMany({
    where: { name: { contains: keyword }, grade, genre, isSoldOut },
    // orderBy: {(orderBy === 'recent' ? {createdAt: desc} : orderBy === price_asc? {price: asc} : {price: desc})}, // (recent)createdAt: desc, (price_asc)price: asc, (price_desc)price: desc
    // take,
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
