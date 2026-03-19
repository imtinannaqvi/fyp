import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

/* =============================
   REGISTER WITH OTP
============================= */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    // ✅ Try sending email but don't crash if it fails
    try {
      await sendEmail(
        email,
        "Verify Your Email - Medico Guidance",
        `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        `
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // ✅ Delete user if email fails so they can retry
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Registration failed: could not send verification email. Please try again.",
      });
    }

    res.status(201).json({
      message: "Registered successfully. OTP sent to email.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =============================
   VERIFY OTP
============================= */

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =============================
   RESEND OTP
============================= */

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Resend OTP - Medico Guidance",
      `
      <h2>New Verification Code</h2>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes.</p>
      `
    );

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =============================
   LOGIN
============================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    // Generate JWT with user role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Login successful",
      token,
      role: user.role, // optionally return role for frontend
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =============================
   LOGOUT
============================= */

export const logout = async (req, res) => {
  res.json({ message: "Logout successful. Remove token from client." });
};

/* =============================
   FORGOT PASSWORD
============================= */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Password - Medico Guidance",
      `
      <h3>Reset your password:</h3>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 15 minutes.</p>
      `
    );

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =============================
   RESET PASSWORD
============================= */

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};