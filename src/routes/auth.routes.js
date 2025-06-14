import express from "express";

import {
  loginService,
  signupController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signupController);

router.post("/login", loginService);

export default router;
