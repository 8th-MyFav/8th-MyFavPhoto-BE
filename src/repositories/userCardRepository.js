import prisma from "../config/prisma.js";

// userCard id 로 카드 검색
async function findById(id) {
  return prisma.userPhotocards.findUnique({
    where: {
      id,
    },
  });
}

export default {
  findById,
};
