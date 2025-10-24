import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import prisma from "./config/prisma.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// 인증 관련 라우트
app.use("/auth", authRouter);

// 서버 healty
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "정상작동 중입니다.",
    timestamp: new Date().toISOString(),
  });
});

// 디비 healty
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`; // DB 연결 테스트
    res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

// 에러 핸들러
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
