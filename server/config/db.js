import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MongoDB URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI); // no extra options needed

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;