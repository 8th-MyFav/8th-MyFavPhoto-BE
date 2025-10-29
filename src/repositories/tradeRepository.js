import prisma from "../config/prisma";

// NOTE: 교환 제안 생성
async function create(
  requester_id,
  offered_card_id,
  target_card_id,
  trade_content
) {
  // 초기 교환 생성 후 알림까지 생성
  const result = await prisma.$transaction(async (tx) => {
    const tradeHistory = await tx.tradeHistories.create({
      data: {
        requester_id,
        offered_card_id,
        target_card_id,
        trade_content,
      },
    });

    // 타겟 카드 소유자 id? creater id?
    const receiver_id = await tx.photocards.findUnique({
      where: {
        creator_id: target_card_id,
      },
      select: { owner_id: true },
    });

    const tradeNotif = await tx.notifications.create({
      data: {
        receiver_id: receiver_id,
        category: "TRADE_OFFERED",
      },
    });
  });
}

export default {
  create,
};
