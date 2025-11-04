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
    const { cardId } = +req.params.cardId;
    const listingDetail = await listingService.removeListing(cardId);
    return res.status(200).json(listingDetail);
  } catch (error) {
    next(error);
  }
}

export async function getMarketListings(req, res, next) {
  try {
    if (!req.query || Object.keys(listingData).length === 0)
      throw errors.invalidQuery();
    const {
      take = 15,
      cursor,
      grade,
      genre,
      isSoldOut,
      orderBy = "recent",
      keyword,
    } = req.query;

    const takeNum = +take;
    const cursorNum = +cursor;
    if (isNaN(takeNum) || takeNum < 0)
      throw errors.invalidData("유효하지 않은 take입니다.");
    if (isNaN(cursorNum) || cursorNum < 0)
      throw errors.invalidData("유효하지 않은 cursor입니다.");
    if (keyword && keyword.length > 50)
      throw errors.invalidData("검색어는 최대 50자까지 입력할 수 있습니다.");

    const listings = await listingService.getMarketListings({
      take,
      cursor,
      grade,
      genre,
      isSoldOut,
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
  } catch (error) {
    next(error);
  }
}
