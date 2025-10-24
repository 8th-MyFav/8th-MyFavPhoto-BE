import userService from "../services/userService.js";

// NOTE: 내 정보 확인
export async function getMe(req, res, next) {
  try {
    const { userId } = req.auth;

    const user = await userService.getMeInfo(userId);
    console.log(user);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
