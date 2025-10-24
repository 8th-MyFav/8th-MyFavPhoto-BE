import express from "express";
import {
  signUp,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", login);
authRouter.post(
  "/refresh-token",
  authMiddleware.verifyRefreshToken,
  refreshToken
);
authRouter.post("/logout", authMiddleware.verifyRefreshToken, logout);

export default authRouter;
