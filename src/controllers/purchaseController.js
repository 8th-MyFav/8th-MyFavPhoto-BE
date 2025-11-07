import * as errors from "../utils/errors.js";
import purchaseService from "../services/purchaseService.js";

export async function purchaseCard(req, res, next) {
  try {
    const { userId } = req.auth;
    const tradePostId = +req.body.tradePostId;
    const count = +req.body.count;
    if (!tradePostId) throw errors.notFound("포스트");
    if (!count) throw errors.invalidData("수량 데이터를 찾을 수 없습니다.");
    const purchase = await purchaseService.purchaseCard({
      userId,
      tradePostId,
      count,
    });
    res.status(200).json(purchase);
  } catch (error) {
    next(error);
  }
}
