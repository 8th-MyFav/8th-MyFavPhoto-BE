import cardService from "../services/cardService.js";
import * as errors from "../utils/errors.js";

/**
 * 카드 생성
 * @param {import("express").Request} req - 요청 객체
 * @param {import("express").Response} res - 응답 객체
 * @param {import("express").NextFunction} next - next 미들웨어
 */
export async function createCard(req, res, next) {
  try {
    const { userId } = req.auth;
    const cardData = req.body;

    if (!cardData || Object.keys(cardData).length === 0)
      throw errors.invalidData("body가 비어있습니다.");

    const card = await cardService.createCard(userId, cardData);
    return res.status(201).json(card);
  } catch (error) {
    next(error);
  }
}

/**
 * 내 카드 목록 조회
 * @param {import("express").Request} req - 요청 객체
 * @param {import("express").Response} res - 응답 객체
 * @param {import("express").NextFunction} next - next 미들웨어
 */
export async function getMyCards(req, res, next) {
  try {
    const { userId } = req.auth;
    const {
      page = 1,
      pageSize = 18,
      grade,
      genre,
      keyword,
      forSale,
    } = req.query;
    const pageNum = +page;
    const pageSizeNum = +pageSize;

    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ message: "페이지 값은 1 이상의 정수여야 합니다." });
    }
    if (isNaN(pageSizeNum) || pageSizeNum < 0 || pageSizeNum > 50) {
      // NOTE: 필요시 100으로 변경
      return res
        .status(400)
        .json({ message: "페이지 크기는 1에서 50 사이여야 합니다." });
    }
    if (keyword && keyword.length > 50) {
      return res
        .status(400)
        .json({ message: "검색어는 최대 50자까지 입력할 수 있습니다." });
    }

    // forSale 파라미터의 존재 여부만 체크하여 boolean으로 변환
    const forSaleCheck = forSale !== undefined;

    const myCards = await cardService.getMyCards({
      userId,
      page: pageNum,
      pageSize: pageSizeNum,
      grade: grade || undefined,
      genre: genre || undefined,
      keyword: keyword || undefined,
      forSale: forSaleCheck,
    });

    return res.status(200).json(myCards);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

/**
 * 내 카드 상세 정보 조회
 * @param {import("express").Request} req - 요청 객체
 * @param {import("express").Response} res - 응답 객체
 * @param {import("express").NextFunction} next - next 미들웨어
 */
export async function getMyCardDetail(req, res, next) {
  try {
    const { userId } = req.auth;
    const cardId = +req.params.cardId;

    if (isNaN(cardId)) {
      return res
        .status(400)
        .json({ message: "카드 아이디를 숫자로 변경해주세요." });
    }

    const myCardDetail = await cardService.getMyCardDetail({ userId, cardId });
    return res.status(200).json(myCardDetail);
  } catch (error) {
    next(error);
  }
}
