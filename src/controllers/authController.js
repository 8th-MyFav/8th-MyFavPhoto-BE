import authService from "../services/authService.js";

// NOTE: 회원가입
export async function signUp(req, res, next) {
  try {
    const { email, password, nickname } = req.body;
    // body로 data 들어왔는지 확인
    if (!email || !password || !nickname) {
      const error = new Error("유효한 값을 모두 작성해주세요.");
      error.code = 400;
      throw error;
    }
    // createUser 호출
    const user = await authService.createUser({ email, password, nickname });

    // 회원가입 성공시 return user data
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

// NOTE: 로그인
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    // body로 data 들어왔는지 확인
    if (!email || !password) {
      const error = new Error("유효한 값을 모두 작성해주세요.");
      error.code = 400;
      throw error;
    }

    // loginUser 호출
    const user = await authService.loginUser(email, password);

    // token 발급
    const accessToken = await authService.createToken(user);
    const refreshToken = await authService.createToken(user, "refresh");

    // refresh Token update
    await authService.updateUser(user.id, { refreshToken });

    // refresh Token cookie 로 전송
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      // secure: true, // 테스트 환경에서는 사용 불가
    });
    // 나머지는 body 전송
    res.status(200).json({ ...user, accessToken });
  } catch (error) {
    next(error);
  }
}

// NOTE: 토큰 갱신
export async function refreshToken(req, res, next) {
  try {
    // 쿠키의 refresh token 가져오기
    const refreshToken = req.cookies.refreshToken;
    const { userId } = req.auth;

    // token 갱신
    const { newAccessToken, newRefreshToken } = await authService.refreshToken(
      userId,
      refreshToken
    );

    // 새 refreshToken 쿠키로 보내기
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      // secure: true,
      path: "/token/refresh",
    });

    // 새 accessToken body로 보내기
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return next(error);
  }
}

// NOTE: 로그아웃
export async function logout(req, res, next) {}
