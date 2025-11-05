import prisma from "../config/prisma.js";

// NOTE: tradeHistory id로 교환 목록 조회
async function findById(id) {
  return prisma.tradeHistories.findUnique({
    where: {
      id,
    },
  });
}

// NOTE: 타겟 카드 id로 교환 목록 조회
async function findByCardId(id) {
  return prisma.tradeHistories.findMany({
    where: { 
      target_card_id: id,
    },
  });
}

// NOTE: 교환 제안 생성 - 트랜잭션 사용
async function create(
  tx,
  requester_id,
  target_card_id,
  offered_card_id,
  trade_content
) {
  return tx.tradeHistories.create({
    data: {
      requester_id,
      offered_card_id,
      target_card_id,
      trade_content,
    },
  });
}

// NOTE: 교환 제안 상태 수정
async function updateStatus(tx, id, trade_status) {
  return tx.tradeHistories.update({
    where: {
      id,
    },
    data: { trade_status },
  });
}

export default {
  findById,
  findByCardId,
  create,
  updateStatus,
};
