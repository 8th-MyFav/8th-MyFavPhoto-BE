import prisma from "../config/prisma.js";

// NOTE: userCard id로 카드 검색
async function findById(id) {
  return prisma.userPhotocards.findUnique({
    where: {
      id,
    },
  });
}

// NOTE: photocard id로 userPhotocards하나만 반환 - 아무 카드 card용
async function findFirstByCardId(photocards_id) {
  return await prisma.userPhotocards.findFirst({
    where: {
      photocards_id,
    },
  });
}

// NOTE: photocard id로 userPhotocards하나만 반환 - 판매 중 card용
async function findSellingCardById(photocards_id) {
  return await prisma.userPhotocards.findFirst({
    where: {
      photocards_id,
      is_sale: true,
    },
  });
}

// NOTE: photocards id로 판매 중이 아닌 카드가 몇개인지?(재고가 있는지?)
export async function countUnsoldPhotocards(photocards_id) {
  return await prisma.userPhotocards.count({
    where: {
      photocards_id,
      is_sale: false,
    },
  });
}

// NOTE: owner 변경
async function changeOwner(tx = prisma, id, owner_id) {
  return tx.userPhotocards.update({
    where: { id },
    data: { owner_id, is_sale: false },
  });
}

// FIXME: 나중에 확인 후 리팩토링 필요
// NOTE: tradePost id로 userPhotocards하나만 반환
async function findFirstByTradePostId(tradePostId) {
  return prisma.userPhotocards.findFirst({
    where: {
      trade_info_id: tradePostId,
      is_sale: true,
    },
  });
}

export default {
  findById,
  findFirstByCardId,
  findSellingCardById,
  countUnsoldPhotocards,
  changeOwner,
  findFirstByTradePostId,
};
