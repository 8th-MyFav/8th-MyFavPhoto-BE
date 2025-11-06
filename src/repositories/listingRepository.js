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

// NOTE: tradePosts 테이블 가격 수정 (genre, grade 고정)
async function updateTradePrice({ tx = prisma, tradePostId, price }) {
  return tx.tradePosts.update({
    where: { id: tradePostId },
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

// NOTE: trade post id로 잠금 설정
async function findAndLockTradePostById({ tx = prisma, id }) {
  return tx.tradePosts
    .findUniqueOrThrow({
      // 테이블에서 id 일치하는 당일 행 조회
      where: { id },
    })
    .forUpdate(); // 행 수준 잠금 (다른 트랜잭션에서 수정/삭제 금지)
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

/* market listing detail */

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

async function countSoldByPostId({ tx = prisma, postId }) {
  return tx.userPhotocards.count({
    where: { trade_info_id: postId, is_sale: false },
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
  findAndLockTradePostById,
  findByPostId,
  countSoldByPostId,
};
