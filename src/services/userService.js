import authRepository from "../repositories/authRepository.js";

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
    console.log(filteredUser);
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

export default {
  getMeInfo,
};
