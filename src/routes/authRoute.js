import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/singUp", register);
router.post("/singIn", login);

export default router;
