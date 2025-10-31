import authRepository from "../repositories/authRepository.js";
import pointRepository from "../repositories/pointRepository.js";
import * as errors from "../utils/errors.js";

// NOTE: 유저 정보 가져오기
async function getMeInfo(id) {
  try {
    const user = await authRepository.findById(id);
    if (!user) {
      throw errors.unauthorized();
    }

    const { password, refreshToken, ...filteredUser } = user;
    return filteredUser;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

// NOTE: point 가져오기
async function getPointInfo(id) {
  try {
    // const user = await authRepository.findById(id);
    // if (!user) {
    //  throw errors.unauthorized();
    // }

    const points = await pointRepository.findById(id);
    if (!points.acc_point) {
      points.acc_point = 0;
    }

    return points;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }
    throw errors.internalServerError();
  }
}

// NOTE: 랜덤 point 획득
async function gainRandomPoints(id, gainPoint) {
  try {
    // 유효한 값이 아닌 경우
    if (!Number.isInteger(gainPoint)) {
      throw errors.validationError();
    }

    const points = await getPointInfo(id);
    const lastUpdateAt = points.lastRandomPointAt;

    // 1시간이 안 지난 경우
    if (!isOver60Minutes(lastUpdateAt)) {
      throw errors.tooManyRequests("1시간에 1회만 포인트 획득 가능합니다.");
    }

    const lastRandomPointAt = new Date();
    const acc_point = points.acc_point + gainPoint;

    const updatedPoints = await pointRepository.update(id, {
      acc_point,
      lastRandomPointAt,
    });

    return updatedPoints;
  } catch (error) {
    if (error.code === 429 || error.code === 400) {
      throw error;
    }
    throw errors.internalServerError();
  }
}
// 랜덤 획득 후 1시간 확인
function isOver60Minutes(randomAt) {
  if (!randomAt) return true;

  const created = new Date(randomAt);
  const now = new Date();

  const diffMs = now - created; // 밀리초 단위 차이
  const diffMinutes = diffMs / 1000 / 60; // 분 단위로 변환

  return diffMinutes >= 60;
}

export default {
  getMeInfo,
  getPointInfo,
  gainRandomPoints,
};
