import authRepository from "../repositories/authRepository.js";
import pointRepository from "../repositories/pointRepository.js";

// NOTE: 유저 정보 가져오기
async function getMeInfo(id) {
  try {
    const user = await authRepository.findById(id);
    if (!user) {
      const error = new Error("로그인이 필요합니다.");
      error.code = 401;
      throw error;
    }

    const { password, refreshToken, ...filteredUser } = user;
    return filteredUser;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

// NOTE: point 가져오기
async function getPointInfo(id) {
  try {
    const user = await authRepository.findById(id);
    if (!user) {
      const error = new Error("로그인이 필요합니다.");
      error.code = 401;
      throw error;
    }

    console.log("user=> ",user);

    const points  = await pointRepository.findById(id);
    if (!points.acc_point) {
     points.acc_point = 0;
    }

    console.log("point=> ", points.acc_point);

    return points.acc_point;
  } catch (error) {
    if (error.code === 401) {
      throw error;
    }

    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

export default {
  getMeInfo,
  getPointInfo,
};
