import { Genre, Grade } from "@prisma/client";
import prisma from "../config/prisma.js";
import listingRepository from "../repositories/listingRepository.js";
import * as errors from "../utils/errors.js";

// NOTE: 거래 게시글 생성
async function createListing({
  count,
  cardId,
  price,
  trade_grade,
  trade_genre,
  trade_note,
}) {
  const total = await prisma.photocards.count({ where: { id: cardId } });
  if (count > total || count < 0)
    throw errors.validationError("유효하지 않은 카드 수량입니다.");
  if (price < 0) throw errors.invalidData("유효하지 않은 가격입니다.");
  if (!Object.values(Grade).includes(trade_grade))
    throw errors.invalidData("유효하지 않은 등급입니다.");
  if (!Object.values(Genre).includes(trade_genre))
    throw errors.invalidData("유효하지 않은 장르입니다.");

  const createdListing = await prisma.$transaction(async (tx) => {
    // 1. userPhotocards 테이블에서 count만큼 id 가져오기
    const targets = await listingRepository.findAvailable({
      tx,
      cardId,
      count,
    });
    const ids = targets.map((target) => target.id);
    console.log("ids: ", ids);

    // 2. tradePosts 테이블에 trade Post 생성
    const tradePost = await listingRepository.createTradePost({
      tx,
      total_issued: 0,
      trade_grade,
      trade_genre,
      trade_note,
    });
    console.log("tradePost: ", tradePost);

    // 3. userPhotocards에 trade_info_id 연결, is_sale true 변경
    const update = await listingRepository.linkTradeInfo({
      tx,
      ids,
      trade_info_id: tradePost.id,
    });
    console.log("update: ", update);

    // 4. 판매 카드 조회
    const allCards = await listingRepository.findUserPhotocardsByCardId({
      tx,
      cardId,
    });
    const saleCards = allCards.filter((card) => card.is_sale);

    return {
      id: tradePost.id, //post
      cardId, //photocards
      totalIssued: ids.length, // post
      left: ids.length - saleCards.length,
      trade_grade,
      trade_genre,
      trade_note,
      createdAt: tradePost.createdAt,
      updatedAt: tradePost.updatedAt,
    };
  });
  return createdListing;
}

async function updateListing(listingData) {
  const updatedListing = await prisma.$transaction(async (tx) => {
    const { cardId, count, trade_grade, trade_genre, trade_note } = listingData;
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    const cardCount = await listingRepository.countByCardId({ tx, cardId });
    if (count > cardCount || count < 0)
      throw errors.validationError("유효하지 않은 카드 수량입니다.");

    // 현재 상태 조회
    const allCards = await listingRepository.findUserPhotocardsByCardId({
      tx,
      cardId,
    });
    // 기존 판매 개수, 새 판매 개수
    const currentCount = allCards.filter((card) => card.is_sale).length;
    const targetCount = count;

    // 판매 수량 증가: 기존 false -> true
    if (currentCount < targetCount) {
      const setTrue = allCards
        .filter((card) => !card.is_sale)
        .slice(0, targetCount - currentCount)
        .map((card) => card.id);
      await listingRepository.setSaleStatus({ tx, ids: setTrue });
    }

    // 판매 수량 감소: 기존 true -> false
    if (currentCount > targetCount) {
      const setFalse = allCards
        .filter((card) => card.is_sale)
        .slice(0, currentCount - targetCount)
        .map((card) => card.id);
      await listingRepository.resetSaleStatus({ tx, ids: setFalse });
    }

    // 교환 희망 정보 변경
    const tradePostId = await listingRepository.findTradePostIdByCardId({
      tx,
      cardId,
    });
    await listingRepository.updateTradePost({
      tx,
      id: tradePostId,
      trade_genre,
      trade_grade,
      trade_note,
    });

    return {
      cardId,
      tradePostId,
      currentSaleCount: allCards.filter((card) => card.is_sale).length,
      targetSaleCount: targetCount,
      trade_grade,
      trade_genre,
      trade_note,
    };
  });
  return updatedListing;
}

async function removeListing(cardId) {
  const removedListing = prisma.$transaction(async (tx) => {
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    // 1. is_sale: true인 photocards 조회
    const targets = await listingRepository.findStatusTrue({ tx, cardId });
    const ids = targets.map((target) => target.id);

    // 2. 해당 데이터의 is_sale false로 변경
    const update = await listingRepository.resetSaleStatus({ tx, ids });

    return {
      message: "판매 취소 완료",
    };
  });
  return removedListing;
}

export default {
  createListing,
  removeListing,
  updateListing,
};
