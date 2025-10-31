import prisma from "../config/prisma.js";
import validate from "../utils/validate.js";

// NOTE: 교환 목록 조회
async function findByCardId(id) {
  return prisma.tradeHistories.findMany({
    where: {
      target_card_id: id,
    },
  });
}

// NOTE: 교환 제안 생성
async function create(
  requester_id,
  target_card_id,
  offered_card_id,
  trade_content
) {
  // 교환 제안 생성
  const result = await prisma.$transaction(async (tx) => {
    // validate.isEntityExist(offered_card_id, "userPhotocards");

    const offeredCard = await tx.userPhotocards.findUnique({
      where: { id: offered_card_id },
      select: { id: true },
    });
    // 제안할려는 카드 유무 확인
    if (!offeredCard) {
      throw new Error("제안하려는 카드가 존재하지 않습니다.");
    }

    const tradeHistory = await tx.tradeHistories.create({
      data: {
        requester_id,
        offered_card_id,
        target_card_id,
        trade_content,
      },
    });

    // 타겟 카드 생성자 id 확인 = 교환 제안 알림 수신자
    const photocardInfo = await tx.photocards.findUnique({
      where: {
        id: target_card_id,
      },
      select: { creator_id: true },
    });
    // 타겟 카드 유무 확인
    if (!photocardInfo) {
      throw new Error("해당 타겟 카드를 찾을 수 없습니다.");
    }

    // 알림 생성
    const tradeNotif = await tx.notifications.create({
      data: {
        receiver_id: photocardInfo.creator_id,
        category: "TRADE_OFFERED",
        is_read: false,
      },
      select: { id: true },
    });

    return { tradeHistory, tradeNotif };
  });
  return result;
}

export default {
  findByCardId,
  create,
};
