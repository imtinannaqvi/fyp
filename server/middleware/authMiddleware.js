import jwt from "jsonwebtoken";
import User from "../models/user.js"; // THIS WAS MISSING

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded User:", decoded);
    
    // This line was failing because 'User' wasn't imported
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
        return res.status(404).json({ message: "User not found in database" });
    }

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};