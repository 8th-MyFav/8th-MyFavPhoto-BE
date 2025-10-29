import prisma from "../config/prisma.js";

// NOTE: 유저 아이디로 알림 리스트 조회
async function findByUserId(receiver_id, page, pageSize) {
  return prisma.notifications.findMany({
    where: {
      receiver_id,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

// NOTE: 알림 id로 알림 조회
async function findById(id) {
  return prisma.notifications.findUnique({
    where: {
      id,
    },
  });
}

// NOTE: 읽음처리
async function readById(id) {
  return prisma.notifications.update({
    where: {
      id,
    },
    data: { is_read: true },
  });
}

// NOTE: 읽지않은 알림 갯수
async function unreadCount(receiver_id) {
  return prisma.notifications.count({
    where: {
      receiver_id,
      is_read: false,
    },
  });
}

export default {
  findByUserId,
  findById,
  readById,
  unreadCount,
};
