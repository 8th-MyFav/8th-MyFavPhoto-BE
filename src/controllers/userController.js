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
