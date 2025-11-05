import cardService from "../services/cardService.js";

/**
 * 카드 생성 컨트롤러
 *
 * @route POST /cards
 * @description 로그인된 사용자가 새로운 포토카드를 생성합니다.
 *              Controller에서는 HTTP 요청 레벨 검증(빈 body 체크 등)을 수행하고,
 *              Service 레이어로 실제 생성 로직을 전달합니다.
 *
 * @param {Request} req - Express 요청 객체
 * @param {Object} req.user - 인증 미들웨어에서 주입된 로그인 사용자 정보
 * @param {number} req.user.id - 사용자 ID
 * @param {Object} req.body - 카드 생성 정보
 * @param {string} req.body.name - 카드 이름
 * @param {string} req.body.grade - 카드 등급 (COMMON, RARE, SUPER_RARE, LEGENDARY)
 * @param {string} req.body.genre - 카드 장르 (KPOP, ACTOR, ESPORTS, KBO, ANIMATION)
 * @param {number} req.body.price - 카드 가격
 * @param {number} req.body.total_count - 카드 총 수량
 * @param {string} [req.body.description] - 카드 설명
 * @param {string} [req.body.image_url] - 카드 이미지 URL
 * @param {Response} res - Express 응답 객체
 * @param {NextFunction} next - Express next 함수 (에러 핸들링용)
 *
 * @returns {JSON} 생성된 포토카드 정보
 *
 * @throws {Error} - req.body가 비어있으면 400 에러
 * @throws {Error} - Service 레이어에서 발생한 에러는 next(error)로 전달
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

export async function getMyCards(req, res, next) {
  try {
    const { userId } = req.auth;
    const { page = 1, pageSize = 15, grade, genre, keyword } = req.query;
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

    const myCards = await cardService.getMyCards({
      userId,
      page: pageNum,
      pageSize: pageSizeNum,
      grade,
      genre,
      keyword,
    });

    return res.status(200).json(myCards);
  } catch (error) {
    next(error);
  }
}

export async function getMyCardDetail(req, res, next) {
  // getMyCardById
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
