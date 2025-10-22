// 비즈니스 로직: 회원가입, 로그인, 비밀번호 검증, JWT 생성
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 비밀키는 .env로 분리해야 함
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 회원가입
export async function registerUser({ email, password, name }) {}

// 로그인
export async function loginUser({ email, password }) {}
