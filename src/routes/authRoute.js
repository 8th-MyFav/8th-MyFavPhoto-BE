import express from "express";
import {
  signUp,
  login,
  refreshToken,
  logout,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/singUp", signUp);
authRouter.post("/singIn", login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);

export default authRouter;
