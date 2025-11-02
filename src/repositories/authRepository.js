import prisma from "../config/prisma.js";

async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

// nickname만 반환
async function findNickname(id) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      nickname: true,
    },
  });
  return user?.nickname ?? null;
}

async function create(user) {
  return prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
  });
}

async function update(id, data) {
  return prisma.user.update({
    where: {
      id,
    },
    data: data,
  });
}

async function logout(id) {
  return prisma.user.update({
    where: {
      id,
    },
    data: { refreshToken: null },
  });
}

// OAuth에서 사용
async function createOrUpdate(provider, providerId, email, name) {
  return prisma.user.upsert({
    where: { provider, providerId },
    update: { email, name },
    create: { provider, providerId, email, name },
  });
}

export default {
  findById,
  findByEmail,
  findNickname,
  create,
  update,
  logout,
  createOrUpdate,
};
