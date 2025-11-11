import prisma from "../config/prisma.js";
import * as errors from "../utils/errors.js";
import purchaseRepository from "../repositories/purchaseRepository.js";
import notificationRepository from "../repositories/notificationRepository.js";
import authRepository from "../repositories/authRepository.js";
import pointRepository from "../repositories/pointRepository.js";

/* 
카드 구매하기
- 마켓플레이스 카드 상세 페이지에 들어감
- 포스트의 구매 수량을 설정함 (수량 * price in TradePosts)
- 구매 성공시 알림
- 마이갤러리에서 내 카드 확인 가능 (테스트시 확인 필요!: 검색어가 owner_id 말고 creator_id였던 것 같음..)

성공시
- purchaseHistories 테이블에 구매 이력 추가
- 내 포인트 제하기
- 해당 userPhotocard의 is_sale을 false로, owner_id를 userId로 변경 // QUES: 가장 처음에 검증하면 롤백이 쉽고, 가장 마지막에 검증하면 확실한 안전이 보장 되는 것 같음.. 어떻게 할까
- 구매자(userId)와 판매자(creator_id)에게 각각 알림 데이터 추가

예외
- 401: 로그인 유저여야함! (따로 미들웨어에 구현 완)
- 400: 구매 수량이 잔여 카드 수량 보다 많으면 안됨 (invalidData - count)
- 403: 총 가격이 내 포인트보다 많으면 안됨 (insufficientPoints)
- 403: 판매자의 카드가 이미 거래 중이면 안됨 (트랜잭션이 update에 lock을 걸어주기 때문에 판매 ) 
- 404: 카드가 존재해야함!
- 409: 이미 팔린 카드가 있으면 안됨!
- 409: 내 카드는 구매 못함! (따로 미들웨어에 구현 완)
*/

async function purchaseCard({ userId, tradePostId, count }) {
  const purchaseCard = await prisma.$transaction(async (tx) => {
    // 수량 검증
    // tradePostId로 userPhotocards trade_info_id 검색, 그 중 is_sale: false인 애들 제외
    const availableCount = await tx.userPhotocards.count({
      where: { trade_info_id: tradePostId, is_sale: true },
    });
    if (count > availableCount) throw errors.invalidData("구매 가능 수량 초과");

    // 포인트 검증
    // userid로 User 테이블에서 points 검색
    const rawPoints = await purchaseRepository.findPointsByUserId({
      tx,
      userId,
    });
    const points = rawPoints.points.acc_point;
    if (!points) throw errors.insufficientPoints("포인트가 없습니다.");
    const rawPrice = await purchaseRepository.findPriceByPostId({
      tx,
      tradePostId,
    });
    const price = rawPrice.price;
    if (points < count * price) throw errors.insufficientPoints();

    // 카드 검증: 카드 존재 여부
    // 한번 더 하는 이유: 상세페이지 진입 -> 구매 사이에 카드 / 판매 포스트 삭제 가능성, db 상태 변경 시 trade post id 삭제 가능성, race condition / 조건부 update 안전 처리
    const checkPostId = await tx.tradePosts.findUnique({
      where: { id: tradePostId },
    });
    if (!checkPostId) throw errors.notFound("포스트");

    // 구매 로직

    // 1. 구매할 userPhotocard 카드 정보와 id 한번에 get
    const availableCards = await tx.userPhotocards.findMany({
      where: { trade_info_id: tradePostId, is_sale: true },
      orderBy: { id: "asc" },
      take: count,
      select: { id: true },
    });
    const availableCardsIds = availableCards.map((card) => card.id);
    // 구매할 photocard id get
    const targetCard = await tx.photocards.findFirst({
      where: {
        userPhotocards: {
          some: {
            trade_info_id: tradePostId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
    if (!targetCard) throw errors.cardNotFound();

    // 2. 소유자 및 카드 판매 상태 변경
    const updated = await tx.userPhotocards.updateMany({
      where: { id: { in: availableCardsIds }, is_sale: true }, // 불필요한 is_sale 트랜잭션 롤백을 위해 is_sale: true 추가
      data: { owner_id: userId, is_sale: false },
    });

    // 3. 품절 검증 (DB 업데이트 직전)
    // 타 유저가 내게 배당됐던 특정 id의 데이터를 바꾸면 '누구'가 다시 최신 상태의 DB에서 id 조회 (findMany부터 다시)
    if (updated.count !== count)
      throw errors.cardAlreadySold("일부 카드가 이미 판매 완료되었습니다.");

    // 4. 포인트 차감
    await pointRepository.deduct({
      tx,
      id: userId,
      remainingPoints: points - count * price,
    });

    // 5. purchase history 테이블에 거래 이력 추가
    const purchaseHistory = await tx.purchaseHistories.create({
      data: {
        purchaser_id: userId,
        purchase_card_id: targetCard.id,
      },
    });
    // ANCHOR: purchaseHistories는 updatedAt 필요 없을 듯?

    //const buyer = userId; // 구매자(나)
    const sellerId = targetCard.creator.id; // 판매자(카드생성자)

    // 각각 닉네임
    const buyerNickname = await authRepository.findNicknameWithTx(tx, userId);
    // 각각 알림 내용
    const buyMessage = `[${targetCard.grade}|${targetCard.name}] ${count}장을 성공적으로 구매했습니다.`;
    const soldMessage = `${buyerNickname}님이 [${targetCard.grade}|${targetCard.name}]을 ${count}장 구매했습니다.`;
    const soldOutMessage = `[${targetCard.grade}|${targetCard.name}]이 품절되었습니다.`;

    // 6. 알림 테이블에 구매, 판매 이력 추가
    // 구매완
    await notificationRepository.create(tx, userId, "PURCHASED", buyMessage);
    // 판매완
    await notificationRepository.create(tx, sellerId, "SOLD", soldMessage);
    if (availableCount === count) {
      await notificationRepository.create(
        tx,
        sellerId,
        "SOLD_OUT",
        soldOutMessage
      );
    }

    return { message: "구매 완료", purchaseHistoryId: purchaseHistory.id };
  });
  return purchaseCard;
}

export default { purchaseCard };
