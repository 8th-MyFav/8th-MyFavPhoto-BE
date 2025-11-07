import prisma from "../config/prisma.js";
import * as errors from "../utils/errors.js";
import purchaseRepository from "../repositories/purchaseRepository.js";

/* 
카드 구매하기
- 마켓플레이스 카드 상세 페이지에 들어감
- 포스트의 구매 수량을 설정함 (수량 * price in TradePosts)
- 구매 성공시 알림
- 마이갤러리에서 내 카드 확인 가능 (테스트시 확인 필요!: 검색어가 owner_id 말고 creator_id였던 것 같음..)

성공시
- purchaseHistories 테이블에 구매 이력 추가
- 내 포인트 제하기
- 해당 userPhotocard의 is_sale을 false로, owner_id를 userId로 변경
- 구매자(userId)와 판매자(creator_id)에게 각각 알림 데이터 추가

예외
- 401: 로그인 유저여야함! (따로 미들웨어에 구현 완)
- 400: 구매 수량이 잔여 카드 수량 보다 많으면 안됨 (invalidData - count)
- 403: 총 가격이 내 포인트보다 많으면 안됨 (insufficientPoints)
- 403: 판매자의 카드가 이미 거래 중이면 안됨 (테이블 업데이트에 다른 사람이 구매 완료) 
- 404: 카드가 존재해야함!
- 409: 이미 팔린 카드면 안됨!
- 409: 내 카드는 구매 못함! (따로 미들웨어에 구현 완)
*/

async function purchaseCard({ userId, tradePostId, count }) {
  const purchaseCard = await prisma.$transaction(async (tx) => {
    const purchaseHistoryId = 1;

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
    console.log(count * price);
    if (points < count * price) throw errors.insufficientPoints();

    // 카드 검증
    // 카드 존재 여부
    // 이유: 상세페이지 진입 -> 구매 사이에 카드 / 판매 포스트 삭제 가능성, db 상태 변경 시 trade post id 삭제 가능성, race condition / 조건부 update 안전 처리

    const checkPostId = await tx.tradePosts.findUnique({
      where: { id: tradePostId },
    });
    console.log(checkPostId);
    if (!checkPostId) throw errors.cardNotFound();

    // 품절 검증 (DB 업데이트 직전)
    // race condition: owner_id 변경 직전 id가 변경
    // 조건부 updateMany -> 업데이트 가능한 행 있는지 확인
    const updated = await tx.userPhotocards

    return { message: "구매 완료", purchaseHistoryId };
  });
  return purchaseCard;
}

export default { purchaseCard };
