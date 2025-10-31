// 비즈니스 로직: 회원가입, 로그인, 비밀번호 검증, JWT 생성
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";
import pointRepository from "../repositories/pointRepository.js";
import * as errors from "../utils/errors.js";

// 비밀키는 .env로 분리해야 함
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 비밀번호   해싱 함수
function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// 유저 정보 필터링
function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

// NOTE: 회원가입
async function createUser(user) {
  try {
    // 이메일 중복 확인
    const existedUser = await authRepository.findByEmail(user.email);
    if (existedUser) {
      throw errors.emailAlreadyExists();
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(user.password);
    // user 정보 db 저장 후 반환
    const createdUser = await authRepository.create({
      ...user,
      password: hashedPassword,
    });
    const createdPoints = await pointRepository.create(createdUser.id);

    return filterSensitiveUserData(createdUser);
  } catch (error) {
    if (error.code === 409) {
      throw error;
    }

    throw errors.internalServerError();
  }
}

// 해싱된 비밀번호 비교 함수
async function verifyPassword(inputPassword, password) {
  const isMatch = await bcrypt.compare(inputPassword, password);

  if (!isMatch) {
    throw errors.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
}

// NOTE: 로그인
async function loginUser(email, password) {
  try {
    // email 유무 확인
    const userData = await authRepository.findByEmail(email);
    if (!userData) {
      throw errors.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // 비밀번호 확인
    await verifyPassword(password, userData.password);
    return filterSensitiveUserData(userData);
  } catch (error) {
    if (error.code === 401) throw error;

    throw errors.internalServerError();
  }
}

// NOTE: user 정보 update
async function updateUser(id, data) {
  const updatedUser = await authRepository.update(id, data);
  return filterSensitiveUserData(updatedUser);
}

// NOTE: toekn 생성
async function createToken(user, type) {
  const payload = { userId: user.id };
  const token = jwt.sign(payload, JWT_SECRET, {
    // type 이 "refresh" 일 때는 2주, "access" 일 때는 1시간으로 설정
    expiresIn: type === "refresh" ? "2w" : "1h",
  });
  // 토큰 발급 후 반환
  return token;
}

// NOTE: token 갱신
async function refreshToken(userId, refreshToken) {
  try {
    const user = await authRepository.findById(userId);
    // DB user 정보, refresh token 확인
    if (!user || user.refreshToken !== refreshToken) {
      throw errors.unauthorized("유효하지 않은 refresh token입니다.");  
    }
    // 새로운 accessToken, refreshToekn 발급
    const newAccessToken = await createToken(user);
    const newRefreshToken = await createToken(user, "refresh");

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    if (error.code === 401) throw error;

    throw errors.internalServerError();
  }
}

// NOTE: logout
async function logout(userId) {
  try {
    const user = await authRepository.findById(userId);
    // DB user 정보, refresh token 확인
    if (!user) {
      throw errors.unauthorized();
    }

    return await authRepository.logout(userId);
  } catch (error) {
    if (error.code === 401) throw error;

    throw errors.internalServerError();
  }
}

export default {
  createUser,
  loginUser,
  updateUser,
  createToken,
  refreshToken,
  logout,
};
