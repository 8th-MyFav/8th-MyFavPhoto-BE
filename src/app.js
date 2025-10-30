import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import prisma from "./config/prisma.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import cardRouter from "./routes/cardRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import marketRouter from "./routes/marketRoute.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// 모든 도메인 허용
app.use(cors());

// 라우트
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/notifications", notificationRouter);

// 카드 생성 라우트
app.use("/cards", cardRouter);

// marketplace 라우트
app.use("/market", marketRouter);

// 서버 healty
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "정상작동 중입니다.",
    timestamp: new Date().toISOString(),
  });
});

// DB healty
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
