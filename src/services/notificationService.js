import notificationRepository from "../repositories/notificationRepository.js";

async function getNotificationList(userId, page, pageSize) {
  try {
    // 알림 리스트 유무 확인
    const notificationList = await notificationRepository.findByUserId(
      userId,
      page,
      pageSize
    );

    if (notificationList.length === 0) {
      const error = new Error("알림이 없습니다.");
      error.code = 404;
      throw error;
    }

    // 알림 리스트 반환
    return notificationList;
  } catch (error) {
    if (error.code === 404) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export default {
  getNotificationList,
};
