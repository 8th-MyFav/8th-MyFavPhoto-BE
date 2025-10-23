// 비즈니스 로직: 회원가입, 로그인, 비밀번호 검증, JWT 생성
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";

// 비밀키는 .env로 분리해야 함
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 해싱 함수
function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// 유저 정보 필터링
function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

// 회원가입
async function createUser(user) {
  try {
    // 이메일 중복 확인
    const existedUser = await authRepository.findByEmail(user.email);
    if (existedUser) {
      const error = new Error("이미 존재하는 이메일입니다.");
      error.code = 409;
      error.data = { email: user.email };
      throw error;
    }
    console.log("email check complete");
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(user.password);
    // user 정보 db 저장 후 반환
    const createdUser = await authRepository.save({
      ...user,
      password: hashedPassword,
    });

    return filterSensitiveUserData(createdUser);
  } catch (error) {
    if (error.code === 409) {
      throw error;
    }
    // 백엔드 서버 에러
    const customError = new Error("데이터베이스 작업 중 오류가 발생했습니다");
    customError.code = 500;
    throw customError;
  }
}

// 로그인
async function loginUser({ email, password }) {}

export default {
  createUser,
  loginUser,
};
