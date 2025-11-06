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
  const tradeHistories = prisma.tradeHistories.findMany({
    where: {
      target_card_id: id,
    },
    select: {
      id: true,
      requester_id: true,
      trade_status: true,
      trade_content: true,
      createdAt: true,
      updatedAt: true,
      offeredCard: {
        select: {
          is_sale: true,
          photocard: {
            select: {
              id: true,
              creator_id: true,
              name: true,
              grade: true,
              genre: true,
              image_url: true,
              description: true,
            },
          },
        },
      },
    },
  });

  return (await tradeHistories).map(({ offeredCard, ...rest }) => ({
    ...rest,
    offeredCard: {
      ...offeredCard?.photocard, // photocard 내부 속성들 펼치기
      is_sale: offeredCard?.is_sale, // is_sale 유지
    },
  }));
}

// NOTE: 교환 제안 생성 - 트랜잭션 사용
async function create(
  tx = prisma,
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

// NOTE: 동일한 내용의 교환 제안 생성이 있는지
export async function existsDuplicateTradeCards(offeredCardId, targetCardId) {
  const exists = await prisma.tradeHistories.findFirst({
    where: {
      offered_card_id: offeredCardId,
      target_card_id: targetCardId,
    },
    select: { id: true }, // 최소 데이터만 가져와서 빠름
  });

  return !!exists; // 존재하면 true, 없으면 false
}

export default {
  findById,
  findByCardId,
  create,
  updateStatus,
  existsDuplicateTradeCards,
};
