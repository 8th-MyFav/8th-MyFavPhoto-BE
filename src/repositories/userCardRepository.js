import prisma from "../config/prisma.js";

// NOTE: userCard id로 카드 검색
async function findById(id) {
  return prisma.userPhotocards.findUnique({
    where: {
      id,
    },
  });
}

// NOTE: owner 변경
async function changeOwner(tx = prisma, id, owner_id) {
  return tx.userPhotocards.update({
    where: {
      id,
    },
    data: { owner_id },
  });
}

// FIXME: 나중에 확인 후 리팩토링 필요
// NOTE: tradePost id로 userPhotocards하나만 반환
async function findCardByTradePostId(tradePostId) {
  return prisma.userPhotocards.findFirst({
    where: {
      trade_info_id: tradePostId,
      is_sale: true,
    },
  });
}

export default {
  findById,
  changeOwner,
  findCardByTradePostId,
};
