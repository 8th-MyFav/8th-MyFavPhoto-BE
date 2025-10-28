import prisma from "../config/prisma.js";

async function findById(id) {
  return prisma.points.findUnique({
    where: {
      id,
    },
  });
}

async function create(id) {
  return prisma.points.create({
    data: {
      id: id,
      acc_point: 0,
    },
  });
}

async function update(id, data) {
  return prisma.points.update({
    where: {
      id,
    },
    data: data,
  });
}

export default {
  findById,
  create,
  update,
};
