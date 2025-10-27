import prisma from "../config/prisma.js";

async function findByUserId(receiver_id, page, pageSize) {
  return prisma.notifications.findMany({
    where: {
      receiver_id,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export default {
  findByUserId,
};
