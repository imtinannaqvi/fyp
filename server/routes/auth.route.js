import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} from "../Controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;