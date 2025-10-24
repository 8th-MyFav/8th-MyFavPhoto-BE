import express from "express";
import { getMe } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/me", authMiddleware.verifyAccessToken, getMe);

export default userRouter;
