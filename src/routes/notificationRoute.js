import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getNotification,
  readNotification,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// 전체에 우선적으로 인가 진행
notificationRouter.use(authMiddleware.verifyAccessToken);

notificationRouter.get("/", getNotification);
notificationRouter.patch(
  "/:id/read",
  authMiddleware.verifyNotifAuth,
  readNotification
);

export default notificationRouter;
