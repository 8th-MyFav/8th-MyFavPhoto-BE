import { Genre, Grade } from "@prisma/client";
import prisma from "../config/prisma.js";
import listingRepository from "../repositories/listingRepository.js";
import * as errors from "../utils/errors.js";
import cardRepository from "../repositories/cardRepository.js";

// NOTE: 거래 게시글 생성
async function createListing({
  cardId,
  // price,
  total_count,
  trade_grade,
  trade_genre,
  trade_note,
}) {
  const total = await prisma.photocards.count({ where: { id: cardId } });
  if (total_count > total || total_count < 0)
    throw errors.validationError("유효하지 않은 카드 수량입니다.");
  // if (price < 0) throw errors.invalidData("유효하지 않은 가격입니다.");
  if (!Object.values(Grade).includes(trade_grade))
    throw errors.invalidData("유효하지 않은 등급입니다.");
  if (!Object.values(Genre).includes(trade_genre))
    throw errors.invalidData("유효하지 않은 장르입니다.");

  const createdListing = await prisma.$transaction(async (tx) => {
    // 1. userPhotocards 테이블에서 total_count만큼 id 가져오기
    const targets = await listingRepository.findAvailable({
      tx,
      cardId,
      total_count,
    });
    const ids = targets.map((target) => target.id);
    console.log("ids: ", ids);

    // 2. tradePosts 테이블에 trade Post 생성
    const tradePost = await listingRepository.createTradePost({
      tx,
      total_issued: total_count,
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
      total_count: ids.length,
      left_count: ids.length, // QUES: 생성에서 이 데이터 반환이 굳이 필요한가?
      trade_grade: tradePost.trade_grade,
      trade_genre: tradePost.trade_genre,
      trade_note: tradePost.trade_note,
      createdAt: tradePost.createdAt,
      updatedAt: tradePost.updatedAt,
    };
  });
  return createdListing;
}

async function updateListing(listingData) {
  const updatedListing = await prisma.$transaction(async (tx) => {
    const { cardId, price, total_count, trade_grade, trade_genre, trade_note } =
      listingData;
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    // 현재 상태 조회
    const allCards = await listingRepository.findUserPhotocardsByCardId({
      tx,
      cardId,
    });

    let targetCount = null;
    let tradePostId = null;

    // 1. 판매 수량 조절
    // 기존 판매 개수, 새 판매 개수
    if (total_count !== undefined) {
      const cardCount = await listingRepository.countByCardId({ tx, cardId });
      if (total_count > cardCount || total_count < 0)
        throw errors.validationError("유효하지 않은 카드 수량입니다.");

      const currentSale = allCards.filter((card) => card.is_sale);
      const currentUnsale = allCards.filter((card) => !card.is_sale);
      const currentCount = currentSale.length;
      targetCount = total_count;

      // 판매 수량 증가: 기존 false -> true
      if (currentCount < targetCount) {
        const setTrue = currentUnsale
          .slice(0, targetCount - currentCount)
          .map((card) => card.id);
        await listingRepository.setSaleStatus({ tx, ids: setTrue });
      }

      // 판매 수량 감소: 기존 true -> false
      if (currentCount > targetCount) {
        const setFalse = currentSale
          .slice(0, currentCount - targetCount)
          .map((card) => card.id);
        await listingRepository.resetSaleStatus({ tx, ids: setFalse });
      }
    }

    // 2. 교환 희망 정보 변경 (등급, 장르, 노트)
    if (trade_grade || trade_genre || trade_note) {
      tradePostId = await listingRepository.findTradePostIdByCardId({
        tx,
        cardId,
      });

      const tradeData = {};
      if (trade_grade) tradeData.trade_grade = trade_grade;
      if (trade_genre) tradeData.trade_genre = trade_genre;
      if (trade_note) tradeData.trade_note = trade_note;

      await listingRepository.updateTradePost({
        tx,
        id: tradePostId,
        ...tradeData,
      });
    }

    // 3. 카드 가격 변경
    if (price !== undefined) {
      if (price < 0) throw errors.invalidData("유효하지 않은 가격입니다.");
      await listingRepository.updatePhotocard({ tx, cardId, price });
    }

    return {
      tradePostId,
      cardId,
      // ...(targetCount !== null && { targetSaleCount: targetCount }), // 수정 요청한 판매 개수
      ...(total_count !== undefined && { total_count }),
      ...(trade_grade && { trade_grade }),
      ...(trade_genre && { trade_genre }),
      ...(trade_note && { trade_note }),
    };
  });
  return updatedListing;
}

async function removeListing(cardId) {
  const removedListing = await prisma.$transaction(async (tx) => {
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    // 1. is_sale: true인 photocards 조회
    const targets = await listingRepository.findStatusTrue({ tx, cardId });
    if (!targets.length) throw errors.invalidData("판매 중인 카드가 없습니다.");
    const ids = targets.map((target) => target.id);

    // 2. 해당 데이터의 is_sale false로 변경
    const update = await listingRepository.resetSaleStatus({ tx, ids });

    // 3. tradePosts 테이블 데이터 삭제
    const tradePostId = await listingRepository.findTradePostIdByCardId({
      tx,
      cardId,
    });
    const remove = await listingRepository.deleteTradePost({ tx, tradePostId });

    return {
      message: "판매 취소 완료",
    };
  });
  return removedListing;
}

async function getListingDetail(cardId) {
  const listingDetail = await listingRepository.findByCardId({ cardId });
  return listingDetail;
}

async function getMarketListings({
  take = 15,
  cursor,
  grade,
  genre,
  isSoldOut,
  keyword,
  orderByOption = "recent",
}) {
  // grade, genre 검증
  if (grade && !Object.values(Grade).includes(grade))
    throw errors.invalidQuery("유효하지 않은 등급입니다.");
  if (genre && !Object.values(Genre).includes(genre))
    throw errors.invalidQuery("유효하지 않은 장르입니다.");

  // isSoldOut 품절 검증
  let isSoldOutCheck;

  if (typeof isSoldOut === "string") {
    const lowerCase = isSoldOut.toLowerCase();
    if (lowerCase === "true") isSoldOutCheck = true;
    else if (lowerCase === "false") isSoldOutCheck = false;
    else throw errors.invalidQuery("유효하지 않은 isSoldOut입니다.");
  }

  // 필터링 (grade, genre, isSoldOut, keyword)
  const where = {
    ...(grade && { grade }),
    ...(genre && { genre }),
    ...(isSoldOutCheck !== undefined && {
      userPhotocards: isSoldOutCheck
        ? { none: { is_sale: true } } // userPhotocards에 is_sale이 모두 false인 것만 post 남김
        : { some: { is_sale: true } }, // userPhotocards에 is_sale이 하나라도 true면 post 남김
    }),
    ...(keyword && { name: { contains: keyword, mode: "insensitive" } }),
  };

  // 정렬
  let orderBy;
  switch (orderByOption) {
    case "price_asc":
      orderBy = {
        UserPhotocards: {
          orderBy: { photocard: { price: "asc" } },
        },
      };
      break;
    case "price_desc":
      orderBy = {
        UserPhotocards: {
          orderBy: { photocard: { price: "desc" } },
        },
      };
      break;
    case "recent":
    default:
      orderBy = { createdAt: "desc" };
  }

  // tradePosts 테이블 조회
  const lists = await listingRepository.findAll({
    where,
    take,
    cursor,
    orderBy,
  });

  const formattedList = lists.map((post) => {
    // 판매 중인 카드만 필터링
    const availableCards = post.UserPhotocards.filter(
      (userPhotocard) => !userPhotocard.is_sale
    );

    return {
      id: post.id,
      name: post.UserPhotocards[0]?.photocard.name ?? "",
      nickname: post.UserPhotocards[0]?.photocard.creator.nickname ?? "",
      grade: post.trade_grade,
      genre: post.trade_genre,
      price: post.UserPhotocards[0]?.photocard.price ?? 0,
      total: post.total_count,
      available: availableCards.length,
      image_url: post.UserPhotocards[0]?.photocard.image_url ?? "",
    };
  });

  // tradePost 마지막 id와 nextCursor가 같으면 false, 아니면 true
  const nextCursor = lists.length ? lists[lists.length - 1].id : null;
  const lastData = await prisma.tradePosts.findFirst({
    orderBy: { id: "desc" },
  });
  const hasMore = lastData?.id === nextCursor ? false : true;

  return {
    lists: formattedList,
    nextCursor,
    hasMore,
  };
}

async function getMyListings() {
  const myListings = listingRepository.findByUserId();
  return myListings;
}

export default {
  createListing,
  removeListing,
  updateListing,
  getListingDetail,
  getMarketListings,
  getMyListings,
};
