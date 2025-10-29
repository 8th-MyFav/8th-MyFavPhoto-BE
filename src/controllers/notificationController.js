import notificationService from "../services/notificationService.js";

// NOTE: 알림 조회
export async function getNotification(req, res, next) {
  try {
    const { userId } = req.auth;
    const { page = "1", pageSize = "5" } = req.query;

    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    // 쿼리 유효성 검사
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

// NOTE: 알림 읽음
export async function readNotification(req, res, next) {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    const readNotif = await notificationService.readNotificationItem(
      Number(id)
    );

    return res
      .status(200)
      .json({ id: readNotif.id, is_read: readNotif.is_read });
  } catch (error) {
    next(error);
  }
}
