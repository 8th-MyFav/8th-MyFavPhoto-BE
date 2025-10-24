import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoute.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// 인증 관련 라우트
app.use("/auth", authRouter);

// 에러 핸들러
app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
