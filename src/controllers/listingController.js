import listingService from "../services/listingService.js";
import * as errors from "../utils/errors.js";

export async function createListing(req, res, next) {
  try {
    const { userId } = req.auth; // TODO: 추후 owner_id 정보 추가 시 필요
    const listingData = req.body;

    if (!listingData || Object.keys(listingData).length === 0)
      throw errors.invalidData("body가 비어있습니다.");

    if (
      !listingData.cardId ||
      !listingData.price ||
      !listingData.count ||
      !listingData.trade_grade ||
      !listingData.trade_genre ||
      !listingData.trade_note
    )
      throw errors.invalidData();

    const listing = await listingService.createListing({
      cardId: +listingData.cardId,
      price: +listingData.price,
      count: +listingData.count,
      trade_grade: listingData.trade_grade,
      trade_genre: listingData.trade_genre,
      trade_note: listingData.trade_note,
    });
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req, res, next) {
  try {
    const cardId = +req.params.cardId;
    const listingData = req.body;
    const { count, trade_grade, trade_genre, trade_note } = listingData;

    if (!listingData || Object.keys(listingData).length === 0)
      throw errors.invalidData("body가 비어있습니다.");

    if (
      // !listingData.price ||
      !count ||
      !trade_grade ||
      !trade_genre ||
      !trade_note
    )
      throw errors.invalidData();

    const listing = await listingService.updateListing({
      cardId: +cardId,
      count: +count,
      trade_grade,
      trade_genre,
      trade_note,
    });
    return res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
}

export async function removeListing(req, res, next) {
  try {
    const cardId = +req.params.cardId;
    await listingService.removeListing({ cardId });
    return res.status(200).json({ message: "판매 취소 완료" });
  } catch (error) {
    next(error);
  }
}
