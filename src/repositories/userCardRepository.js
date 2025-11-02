import prisma from "../config/prisma.js";

// userCard id로 카드 검색
async function findById(id) {
  return prisma.userPhotocards.findUnique({
    where: {
      id,
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
