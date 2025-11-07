import prisma from "../config/prisma.js";
import authRepository from "../repositories/authRepository.js";
import cardRepository from "../repositories/cardRepository.js";
import notificationRepository from "../repositories/notificationRepository.js";
import tradeRepository from "../repositories/tradeRepository.js";
import userCardRepository from "../repositories/userCardRepository.js";
import * as errors from "../utils/errors.js";
import validate from "../utils/validate.js";

// NOTE: 교환 제안 생성
async function createTrade(userId, tradePostId, offeredCardId, content) {
  try {
    // 교환 요청자 정보
    const requester = await authRepository.findById(userId);

    // 타겟 포토카드 하나만 가져오기
    const targetPhotocard = await userCardRepository.findFirstByTradePostId(
      tradePostId
    );
    if (!targetPhotocard)
      throw errors.cardNotFound("교환할 카드가 존재하지 않습니다.");

    // 제안된 카드가 재고가 남았는지 확인
    await validate.isCardInStock(
      offeredCardId,
      userId,
      "현재 판매 중인 카드는 제안할 수 없습니다."
    );

    const targetCardId = targetPhotocard.photocards_id;
    // 동일한 교환 제안이 있는지 확인
    await validate.validatePropose(offeredCardId, targetCardId);
    const photocardInfo = await cardRepository.findByCardId(targetCardId);

    // 알림 내용
    const notifContent = `${requester.nickname}님이 [${photocardInfo.grade}|${photocardInfo.name}]의 포토카드 교환을 제안했습니다.`;

    // tradehistory 생성 + 교환 제안 알림 생성
    const result = await prisma.$transaction(async (tx) => {
      // tradeHistory 생성
      const tradeHistory = await tradeRepository.create(
        tx,
        userId,
        targetCardId,
        offeredCardId,
        content
      );
      // 알람생성
      const tradeNotif = await notificationRepository.create(
        tx,
        photocardInfo.creator_id,
        "TRADE_OFFERED",
        notifContent
      );

      return tradeHistory;
    });

    return result;
  } catch (error) {
    if ([401, 404, 409].includes(error.code)) {
      throw error;
    }

    throw errors.internalServerError();
  }
}

// NOTE: 교환 제안 목록 조회
async function getTradesHistory(cardId) {
  try {
    // 교환 제안 존재 확인
    const tradeHistories = await tradeRepository.findByCardId(cardId);

    if (tradeHistories.length === 0) {
      throw errors.tradeNotFound("제안 내역이 없습니다.");
    }

    // 교환 제안 목록 + 제안한 카드의 정보 포함 (offeredCard Info 필요)
    return tradeHistories;
  } catch (error) {
    if (error.code !== 500) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

// NOTE: 교환 제안 승인 <- userPhotocards가 아니라 photocards id로 들어오는걸로 변경
async function patchTradeApprove(tradeId, userId) {
  try {
    const tradeHistory = await tradeRepository.findById(tradeId);
    // 교환 제안이 없는 경우
    if (!tradeHistory) throw errors.tradeNotFound();
    // 교환 제안이 이미 처리된 경우
    if (tradeHistory.trade_status !== "PENDING")
      throw errors.invalidTradeStatus();

    // 타켓 카드 정보
    const photocardInfo = await cardRepository.findByCardId(
      tradeHistory.target_card_id
    );

    const targetCardOwner = userId; // 타겟카드 주인
    const offeredCardOwner = tradeHistory.requester_id; // 교환 제안 카드 주인

    // 각각 닉네임
    const targetCardOwnerNickname = await authRepository.findNickname(
      targetCardOwner
    );
    const offeredCardOwnerNickname = await authRepository.findNickname(
      offeredCardOwner
    );
    // 각각 알림 내용
    const targetNotifContent = `${targetCardOwnerNickname}님과의 [${photocardInfo.grade}|${photocardInfo.name}]의 포토카드 교환이 성사되었습니다.`;
    const offerNotifContent = `${offeredCardOwnerNickname}님과의 [${photocardInfo.grade}|${photocardInfo.name}]의 포토카드 교환이 성사되었습니다.`;

    // tradehistory 승인 + 교환 승인 알림 각각 생성
    const result = await prisma.$transaction(async (tx) => {
      // REVIEW: 검증 및 row 쓰기 Rock
      // 각각 실제 교환할 카드 owner id 확인할것
      const targetCard = await userCardRepository.findSellingCardById(
        tx,
        tradeHistory.target_card_id,
        targetCardOwner
      );
      // target 카드의 재고가 남아있는지
      if (!targetCard) throw errors.cannotOnSaleCard("카드의 재고가 없습니다.");

      const offeredCard = await userCardRepository.findUnsoldPhotocards(
        tx,
        tradeHistory.offered_card_id,
        offeredCardOwner
      );
      // offered 카드의 재고가 남아있는지
      if (!offeredCard)
        throw errors.cannotOnSaleCard("제안된 카드의 재고가 없습니다.");

      // 교환 상태 승인으로 변경
      const approve = await tradeRepository.updateStatus(
        tx,
        tradeId,
        "COMPLETED"
      );

      // target card 소유자 변경
      const changeTarget = await userCardRepository.changeOwner(
        tx,
        targetCard.id,
        offeredCardOwner
      );
      // offered card 소유자 변경
      const changeOffered = await userCardRepository.changeOwner(
        tx,
        offeredCard.id,
        targetCardOwner
      );

      // 알림 생성
      const targetNotif = await notificationRepository.create(
        tx,
        targetCardOwner,
        "TRADE_ACCEPTED",
        targetNotifContent
      );
      const offeredNotif = await notificationRepository.create(
        tx,
        offeredCardOwner,
        "TRADE_ACCEPTED",
        offerNotifContent
      );

      return approve;
    });

    return result;
  } catch (error) {
    if (error.code !== 500) {
      throw error;
    }
    throw errors.internalServerError();
  }
}
// NOTE: 교환 제안 거절
async function patchTradeReject(tradeId) {
  try {
    const tradeHistory = await tradeRepository.findById(tradeId);
    // 교환 제안이 없는 경우
    if (!tradeHistory) throw errors.tradeNotFound();
    // 교환 제안이 이미 처리된 경우
    if (tradeHistory.trade_status !== "PENDING")
      throw errors.invalidTradeStatus();

    const photocardInfo = await cardRepository.findByCardId(
      tradeHistory.target_card_id
    );
    // 알림 내용
    const notifContent = `[${photocardInfo.grade}|${photocardInfo.name}]의 포토카드 교환이 거절되었습니다.`;

    // tradehistory 수정 + 교환 거절 알림 생성
    const result = await prisma.$transaction(async (tx) => {
      const reject = await tradeRepository.updateStatus(tx, tradeId, "REJECED");

      // 알람생성
      const tradeNotif = await notificationRepository.create(
        tx,
        tradeHistory.requester_id,
        "TRADE_REJECTED",
        notifContent
      );
      return reject;
    });

    return result;
  } catch (error) {
    if (error.code !== 500) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

export default {
  createTrade,
  getTradesHistory,
  patchTradeApprove,
  patchTradeReject,
};
