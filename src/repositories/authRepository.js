import prisma from "../config/prisma.js";

async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}
