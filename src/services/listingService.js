import { Genre, Grade } from "@prisma/client";
import prisma from "../config/prisma.js";
import listingRepository from "../repositories/listingRepository.js";
import * as errors from "../utils/errors.js";

/**
 * 판매 게시글 생성
 * @param {object} listingData - 생성할 게시글 데이터
 * @returns {Promise<object>} 생성된 게시글 정보
 */
async function createListing({
  cardId,
  total_count,
  trade_grade,
  trade_genre,
  trade_note,
}) {
  const total = await prisma.userPhotocards.count({
    where: { photocards_id: cardId },
  });
  if (total_count > total || total_count < 0)
    throw errors.validationError("유효하지 않은 카드 수량입니다.");
  // if (price < 0) throw errors.invalidData("유효하지 않은 가격입니다.");
  if (!Object.values(Grade).includes(trade_grade))
    throw errors.invalidData("유효하지 않은 등급입니다.");
  if (!Object.values(Genre).includes(trade_genre))
    throw errors.invalidData("유효하지 않은 장르입니다.");

  const createdListing = await prisma.$transaction(async (tx) => {
    // 0. 이미 판매 등록된 카드인지 확인
    const existingPostId = await listingRepository.findTradePostIdByCardId({
      tx,
      cardId,
    });
    if (existingPostId) {
      throw errors.cardAlreadyInTrade("이미 판매 등록된 카드입니다.");
    }

    // 1. userPhotocards 테이블에서 total_count만큼 id 가져오기
    const targets = await listingRepository.findAvailable({
      tx,
      cardId,
      total_count,
    });
    if (targets.length === 0)
      throw errors.validationError("판매할 수 있는 카드가 없습니다.");
    const ids = targets.map((target) => target.id);
    // 먼저 이 카드에 post id 가 있는지 검증해야됨. 이미 판매 올라간 카드일 수도 있으니까..
    // 2. tradePosts 테이블에 trade Post 생성
    // photocard cardid로 price 접근해서 price 변수에 할당
    const { price: priceValue } = await prisma.photocards.findUnique({
      where: { id: cardId },
      select: { price: true },
    }); // { price: 1000 }객체로 옴
    const tradePost = await listingRepository.createTradePost({
      tx,
      total_count,
      trade_grade,
      trade_genre,
      trade_note,
      price: priceValue, // 값(숫자)로 넘겨야 함
    });

    // 3. userPhotocards에 trade_info_id 연결, is_sale true 변경
    const update = await listingRepository.linkTradeInfo({
      tx,
      ids,
      trade_info_id: tradePost.id,
    });
    // 업데이트 개수가 예상과 다를 시
    if (update.count !== ids.length) {
      throw errors.validationError(
        `일부 카드 업데이트 실패: 예상 ${ids.length}개, 실제 ${update.count}개`
      );
    }

    return {
      id: tradePost.id, //post
      cardId, //photocards
      total_count: ids.length,
      left_count: ids.length,
      trade_grade: tradePost.trade_grade,
      trade_genre: tradePost.trade_genre,
      trade_note: tradePost.trade_note,
      createdAt: tradePost.createdAt,
      updatedAt: tradePost.updatedAt,
    };
  });
  return createdListing;
}

/**
 * 판매 게시글 수정
 * @param {object} listingData - 수정할 게시글 데이터
 * @returns {Promise<object>} 수정된 게시글 정보
 */
async function updateListing(listingData) {
  const updatedListing = await prisma.$transaction(async (tx) => {
    const { cardId, price, total_count, trade_grade, trade_genre, trade_note } =
      listingData;
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    const tradePostId = await listingRepository.findTradePostIdByCardId({
      tx,
      cardId,
    });

    if (!tradePostId) {
      throw errors.notFound("판매 게시글을 찾을 수 없습니다.");
    }

    // NOTE: 비관적 잠금(Pessimistic Lock)을 통해 tradePost 레코드를 잠급니다.
    // 이 트랜잭션이 끝날 때까지 다른 트랜잭션은 이 레코드를 수정할 수 없습니다.
    // await listingRepository.findAndLockTradePostById({ tx, id: tradePostId });
    // TODO: 구매 로직 참고해 레코드 잠금 개선할 것

    // 1. 판매 수량 조절
    // 기존 판매 개수, 새 판매 개수
    if (total_count !== undefined) {
      const cardCount = await listingRepository.countByCardId({ tx, cardId });
      if (total_count > cardCount || total_count < 0)
        throw errors.validationError("유효하지 않은 카드 수량입니다.");

      const allCards = await listingRepository.findUserPhotocardsByCardId({
        tx,
        cardId,
      });
      const currentSale = allCards.filter((card) => card.is_sale);
      const currentUnsale = allCards.filter((card) => !card.is_sale);
      const currentCount = currentSale.length;
      const targetCount = total_count;

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
      await listingRepository.updateTradePrice({ tx, tradePostId, price });
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

/**
 * 판매 게시글 삭제
 * @param {number} cardId - 포토카드 ID
 * @returns {Promise<object>} 삭제 완료 메시지
 */
async function removeListing(cardId) {
  console.log(cardId);
  const removedListing = await prisma.$transaction(async (tx) => {
    if (!cardId) throw errors.invalidData("유효하지 않은 카드 id입니다");

    // 1. is_sale: true인 photocards 조회
    const targets = await listingRepository.findStatusTrue({ tx, cardId });
    if (!targets.length) throw errors.invalidData("판매 중인 카드가 없습니다.");
    const ids = targets.map((target) => target.id);

    // 2. tradePosts 테이블 데이터 id 조회
    const tradePostId = await listingRepository.findTradePostIdByCardId({
      tx,
      cardId,
    });

    // 3. 해당 데이터의 is_sale false로 변경
    const update = await listingRepository.resetSaleStatus({ tx, ids });

    // 4. tradePosts 테이블 데이터 삭제
    await listingRepository.deleteTradePost({ tx, tradePostId });

    return {
      message: "판매 취소 완료",
    };
  });
  return removedListing;
}

/**
 * 판매 게시글 상세 조회
 * @param {object} options - 조회 옵션
 * @param {number} options.postId - 포스트 ID
 * @returns {Promise<object>} 게시글 상세 정보
 */
async function getListingDetail({ postId }) {
  const listingDetail = await listingRepository.findByPostId({ postId });
  if (!listingDetail) {
    throw errors.notFound("판매 게시글");
  }
  const photocard = listingDetail.UserPhotocards?.[0]?.photocard;
  const soldCards = await listingRepository.countSoldByPostId({ postId }); // 이미 팔린 카드

  const formatted = {
    id: listingDetail.id,
    trade_grade: listingDetail.trade_grade,
    trade_genre: listingDetail.trade_genre,
    trade_note: listingDetail.trade_note,
    price: listingDetail.price,
    total_count: listingDetail.total_count,
    left_count: listingDetail.total_count - soldCards,
    card: photocard
      ? {
          id: photocard.id,
          nickname: photocard.creator?.nickname,
          image_url: photocard.image_url,
          name: photocard.name,
          description: photocard.description,
          grade: photocard.grade,
          genre: photocard.genre,
        }
      : null,
    createdAt: listingDetail.createdAt,
    updatedAt: listingDetail.updatedAt,
  };

  return formatted;
}

/**
 * 마켓 판매 게시글 목록 조회
 * @param {object} options - 조회 옵션
 * @returns {Promise<object>} 게시글 목록, 다음 커서, 추가 데이터 여부
 */
async function getMarketListings({
  take = 18,
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
    AND: [
      // 판매 상태 필터링
      {
        UserPhotocards:
          isSoldOutCheck === true
            ? { none: { is_sale: true } } // userPhotocards의 is_sale이 모두 false인 post만 남김
            : isSoldOutCheck === false
            ? { some: { is_sale: true } } // userPhotocards의 is_sale:이 하나라도 true인 post 남김
            : {}, // 모든 게시글
      },
      {
        UserPhotocards: {
          // 연결된 카드 중 하나라도 조건을 만족하면 됨
          some: {
            photocard: {
              ...(grade && { grade }),
              ...(genre && { genre }),
              ...(keyword && {
                name: { contains: keyword, mode: "insensitive" },
              }),
            },
          },
        },
      },
    ],
  };

  // 정렬
  let orderBy;
  switch (orderByOption) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "recent":
    default:
      orderBy = { createdAt: "desc" };
  }

  // tradePosts 테이블 조회
  const lists = await listingRepository.findAll({
    where,
    take: take + 1, // 요청된 개수보다 하나 더 조회
    cursor,
    orderBy,
  });

  // hasMore 계산 및 응답 목록 슬라이싱
  const hasMore = lists.length > take;
  const responseLists = hasMore ? lists.slice(0, take) : lists;
  const nextCursor = responseLists.length
    ? responseLists[responseLists.length - 1].id
    : null;

  const formattedList = responseLists.map((post) => {
    // post에 연결된 userPhotocards가 없을 때
    if (post.UserPhotocards && post.UserPhotocards.length === 0) {
      throw errors.notFound(`포스트 ${post.id}`);
    }
    // 판매 중인 카드만 필터링
    const availableCards = post.UserPhotocards.filter(
      (userPhotocard) => userPhotocard.is_sale
    );
    // 첫번째 카드
    const firstCard = post.UserPhotocards[0]?.photocard;
    return {
      id: post.id,
      name: firstCard.name ?? "",
      nickname: firstCard.creator.nickname ?? "",
      grade: firstCard.grade,
      genre: firstCard.genre,
      price: post.price ?? 0,
      total: post.total_count,
      available: availableCards.length,
      image_url: firstCard.image_url ?? "",
    };
  });

  return {
    lists: formattedList,
    nextCursor,
    hasMore,
  };
}

/**
 * 내 판매/교환 내역 조회
 * @param {object} options - 조회 옵션
 * @returns {Promise<object>} 내 판매/교환 내역 목록 및 페이지 정보
 */
async function getMyListings({
  userId,
  page,
  pageSize,
  grade,
  genre,
  keyword,
  saleType,
  isSoldOut,
}) {
  // grade, genre 검증
  if (grade && !Object.values(Grade).includes(grade))
    throw errors.invalidQuery("유효하지 않은 등급입니다.");
  if (genre && !Object.values(Genre).includes(genre))
    throw errors.invalidQuery("유효하지 않은 장르입니다.");

  // keyword 검증 (controller에서 했는데 service level에서도 할게 있나?)

  // saleType 검증
  if (saleType && saleType !== "sell" && saleType !== "trade")
    throw errors.invalidQuery("유효하지 않은 saleType입니다.");

  // saleType에 따른 필터링 처리
  const tradeHistories =
    await listingRepository.findTradeHistoriesByRequesterId({
      requester_id: userId,
    });
  const offeredCardIds = tradeHistories.map((th) => th.offered_card_id);

  let saleTypeFilter = {};
  if (saleType === "sell") {
    // trade_info_id가 null이 아닌 행만
    saleTypeFilter = { trade_info_id: { not: null } };
  } else if (saleType === "trade") {
    if (offeredCardIds.length > 0) {
      // offeredCardIds에 있는 id에 해당하는 행만
      saleTypeFilter = { photocards_id: { in: offeredCardIds } };
    } else {
      // 교환 제시한 카드가 없으면 빈 결과 반환
      saleTypeFilter = { photocards_id: { in: [] } };
    }
  }

  // isSoldOut에 따른 필터링 처리
  let isSoldOutFilter = {};
  if (isSoldOut) {
    // 품절
    isSoldOutFilter = { owner_id: { not: userId } };
  } else {
    // 품절제외
    isSoldOutFilter = { owner_id: userId };
  }

  const where = {
    photocard: {
      creator_id: userId,
      ...(grade && { grade }),
      ...(genre && { genre }),
      ...(keyword && {
        name: { contains: keyword, mode: "insensitive" },
      }),
    },
    OR: [
      { trade_info_id: { not: null } },
      { photocards_id: { in: offeredCardIds } }, // photocards_id가 offeredIds id에 해당되는 행만
    ],
    ...(Object.keys(saleTypeFilter).length > 0 && saleTypeFilter),
    ...(Object.keys(isSoldOutFilter).length > 0 && isSoldOutFilter),
  };

  const myListings = await listingRepository.findUserPhotocardsByUserId({
    where,
    page,
    pageSize,
  });

  // 전체 개수
  const totalCount = await prisma.userPhotocards.count({
    where: { owner_id: userId },
  });

  // 등급 기본값 초기화 (groupBy 관계 필드 지원XX) -> join 수행, 각 userPC별 등급 접근 -> count
  const gradeCounts = Object.fromEntries(
    Object.values(Grade).map((grade) => [grade, 0])
  ); // TODO: 추후 내 판매 카드 목록과 함수 공통화

  // 등급별 개수 계산
  const gradeData = await prisma.userPhotocards.findMany({
    where,
    select: { photocard: { select: { grade: true } } },
  });
  gradeData.forEach(({ photocard }) => (gradeCounts[photocard.grade] += 1));

  const list = myListings.map((listing) => ({
    id: listing.id,
    name: listing.photocard.name,
    grade: listing.photocard.grade,
    genre: listing.photocard.genre,
    available: listing.owner_id === userId ? 1 : 0,
    image_url: listing.photocard.image_url,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  }));
  return {
    totalCount: myListings.length,
    totalGrades: gradeCounts,
    page,
    pageSize,
    totalPage: Math.ceil(myListings.length / pageSize),
    list,
  };
}

export default {
  createListing,
  removeListing,
  updateListing,
  getListingDetail,
  getMarketListings,
  getMyListings,
};
