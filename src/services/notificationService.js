import notificationRepository from "../repositories/notificationRepository.js";
import * as errors from "../utils/errors.js";

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
      throw errors.notificationNotFound("알림이 없습니다.");
    }

    // 알림 리스트 반환
    return notificationList;
  } catch (error) {
    if (error.code === 404) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

// NOTE: 알림 read
async function readNotificationItem(id) {
  try {
    const notification = await notificationRepository.findById(id);

    if (notification.is_read) {
      throw errors.alreadyReadNotification();
    }

    const readNotification = await notificationRepository.readById(id);
    return readNotification;
  } catch (error) {
    if (error.code === 404 || error.code === 409) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

export default {
  getNotificationList,
  readNotificationItem,
};
