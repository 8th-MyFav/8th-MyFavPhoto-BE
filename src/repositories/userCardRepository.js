import prisma from "../config/prisma.js";

// userCard id로 카드 검색
async function findById(id) {
  return prisma.userPhotocards.findUnique({
    where: {
      id,
    },
  });
}

// trade_info_id 로 카드 검색해서 하나만 반환
async function findFirstByTradInfoId(id) {
  return prisma.userPhotocards.findFirst({
    where: {
      trade_info_id: id,
      is_sale: true,
    },
  });
}

async function changeOwner(tx, id, owner_id) {
  return tx.userPhotocards.update({
    where: {
      id,
    },
    data: { owner_id },
  });
}

export default {
  findById,
  changeOwner,
};
