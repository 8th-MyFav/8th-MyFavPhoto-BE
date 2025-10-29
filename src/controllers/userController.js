import userService from "../services/userService.js";

// NOTE: 내 정보 조회
export async function getMe(req, res, next) {
  try {
    const { userId } = req.auth;

    const user = await userService.getMeInfo(userId);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// NOTE: 내 point 조회
export async function getPoints(req, res, next) {
  try {
    const { userId } = req.auth;

    const point = await userService.getPointInfo(userId);
    return res.status(200).json(point);
  } catch (error) {
    next(error);
  }
}

// NOTE: 랜덤 Point 추가
export async function randomPoints(req, res, next) {
  try {
    const { userId } = req.auth;
    const { point } = req.body;
    
    if (!point) {
      const error = new Error("유효한 point가 없습니다.");
      error.code = 400;
      throw error;
    }

    const points = await userService.gainRandomPoints(userId, point);
    return res.status(200).json(points);
  } catch (error) {
    next(error);
  }
}
