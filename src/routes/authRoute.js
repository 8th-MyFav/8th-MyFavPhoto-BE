import express from "express";
import {
  signUp,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/singUp", signUp);
authRouter.post("/singIn", login);
authRouter.post(
  "/refresh-token",
  authMiddleware.verifyRefreshToken,
  refreshToken
);
authRouter.post("/logout", logout);

export default authRouter;
