import notificationRepository from "../repositories/notificationRepository.js";

// NOTE: 알림 리스트 조회
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

// NOTE: 알림 read
async function readNotificationItem(id) {
  try {
    const notification = await notificationRepository.findById(id);

    if (notification.is_read) {
      const error = new Error("이미 읽은 알림입니다.");
      error.code = 409;
      throw error;
    }

    const readNotification = await notificationRepository.readById(id);
    return readNotification;
  } catch (error) {
    if (error.code === 404 || error.code === 409) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export default {
  getNotificationList,
  readNotificationItem,
};
