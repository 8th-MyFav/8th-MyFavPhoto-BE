import notificationService from "../services/notificationService.js";

export async function getNotification(req, res, next) {
  try {
    const { userId } = req.auth;
    const { page = "1", pageSize = "5" } = req.query;

    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    // 유효성 검사
    if (
      !Number.isInteger(pageNum) ||
      pageNum < 1 ||
      !Number.isInteger(pageSizeNum) ||
      pageSizeNum < 1
    ) {
      const error = new Error("잘못된 쿼리 파라미터입니다.");
      error.code = 400;
      throw error;
    }

    const notifications = await notificationService.getNotificationList(
      userId,
      pageNum,
      pageSizeNum
    );

    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}
