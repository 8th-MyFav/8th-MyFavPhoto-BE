import authService from "../services/authService.js";

// 회원가입
export async function signUp(req, res, next) {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      const error = new Error("유효한 값을 모두 작성해주세요.");
      error.code = 400;
      throw error;
    }
    // authService 호출
    const user = await authService.createUser({ email, password, nickname });

    // 회원가입 성공시 return user data
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

// 로그인
export async function login(req, res, next) {}

// 리프레시 토크 갱신
export async function refreshToken(req, res, next) {}

// 로그아웃
export async function logout(req, res, next) {}
