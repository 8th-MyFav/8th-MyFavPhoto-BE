import listingService from "../services/listingService.js";
import * as errors from "../utils/errors.js";

export async function createListing(req, res, next) {
  try {
    const { userId } = req.auth; // TODO: 추후 owner_id 정보 추가 시 필요
    const listingData = req.body;
    const { cardId, total_count, trade_grade, trade_genre, trade_note } =
      listingData; // price 제외

    if (!listingData || Object.keys(listingData).length === 0)
      throw errors.invalidData("body가 비어있습니다.");

    if (
      !cardId ||
      // !price ||
      !total_count ||
      !trade_grade ||
      !trade_genre // || !trade_note
    )
      throw errors.invalidData();

    const created = await listingService.createListing({
      cardId: +cardId,
      // price: +price,
      total_count: +total_count,
      trade_grade,
      trade_genre,
      trade_note,
    });
    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req, res, next) {
  try {
    const cardId = +req.params.cardId;
    if (isNaN(cardId)) throw errors.invalidData("유효하지 않은 카드 id입니다.");

    if (Object.keys(req.body).length === 0)
      throw errors.invalidData("body가 비어있습니다.");

    const updated = await listingService.updateListing({ cardId, ...req.body });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function removeListing(req, res, next) {
  try {
    const cardId = +req.params.cardId;
    await listingService.removeListing(cardId);
    return res.status(200).json({ message: "판매 취소 완료" });
  } catch (error) {
    next(error);
  }
}

export async function getListingDetail(req, res, next) {
  try {
    const postId = +req.params.postId;
    if (isNaN(postId))
      throw errors.invalidData("유효하지 않은 게시글 id입니다.");
    const listingDetail = await listingService.getListingDetail({
      postId,
    });
    return res.status(200).json(listingDetail);
  } catch (error) {
    next(error);
  }
}

export async function getMarketListings(req, res, next) {
  try {
    const {
      take = 15,
      cursor,
      grade,
      genre,
      isSoldOut,
      orderBy = "recent",
      keyword,
    } = req.query || {};

    const takeNum = +take;
    if (isNaN(takeNum) || takeNum < 0)
      throw errors.invalidData("유효하지 않은 take입니다.");

    // +cursor 전 null/undefined 처리
    let cursorNum;
    if (cursor != null) {
      cursorNum = +cursor;
      // 숫자, 음수 검증
      if (isNaN(cursorNum) || cursorNum < 0) {
        throw errors.invalidData("유효하지 않은 cursor입니다.");
      }
    }

    if (keyword && keyword.length > 50)
      throw errors.invalidData("검색어는 최대 50자까지 입력할 수 있습니다.");

    const listings = await listingService.getMarketListings({
      take: takeNum,
      cursor: cursorNum,
      grade,
      genre,
      isSoldOut: isSoldOutCheck,
      orderByOption: orderBy,
      keyword,
    });
    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
}

export async function getMyListings(req, res, next) {
  try {
    const { userId } = req.auth;
    const {
      page = 1,
      pageSize = 15,
      grade,
      genre,
      saleType,
      isSoldOut,
      keyword,
    } = req.query || {};
    const pageNum = +page;
    const pageSizeNum = +pageSize;

    if (isNaN(pageNum) || pageNum < 1)
      throw errors.invalidQuery("유효하지 않은 page입니다.");
    if (isNaN(pageSizeNum) || pageSizeNum < 0 || pageSizeNum > 50)
      throw errors.invalidQuery("유효하지 않은 pageSize입니다.");
    if (keyword && keyword.length > 50)
      throw errors.invalidQuery("검색어는 최대 50자까지 입력 가능합니다.");

    // isSoldOut 품절 검증 (string 입력값일 때) & 매핑
    const isSoldOutCheck =
      isSoldOut == null
        ? undefined
        : ["true", "1", true, 1].includes(isSoldOut)
        ? true
        : ["false", "0", false, 0].includes(isSoldOut)
        ? false
        : (() => {
            throw errors.invalidQuery("유효하지 않은 isSoldOut입니다.");
          })();

    const myListings = await listingService.getMyListings({
      userId,
      page: pageNum,
      pageSize: pageSizeNum,
      grade: grade ?? undefined,
      genre: genre ?? undefined,
      keyword: keyword ?? undefined,
      saleType: saleType?.toLowerCase() ?? undefined,
      isSoldOut: isSoldOutCheck ?? undefined,
    });
    console.log(myListings);
    return res.status(200).json(myListings);
  } catch (error) {
    next(error);
  }
}
