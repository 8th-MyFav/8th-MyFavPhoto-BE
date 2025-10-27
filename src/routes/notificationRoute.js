import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getNotification } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// 전체에 우선적으로 인가 진행
notificationRouter.use(authMiddleware.verifyAccessToken);

notificationRouter.get("/", getNotification);

export default notificationRouter;
