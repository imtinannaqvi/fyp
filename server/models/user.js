import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  username:  { type: String, unique: true, sparse: true, trim: true, lowercase: true }, // ✅ added
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ["user", "admin"], default: "user" },
  isVerified:{ type: Boolean, default: false },
  otp:       { type: String },
  otpExpiry: { type: Date },

  // Password Reset
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },

  // Health Profile
  gender:     { type: String, enum: ["male", "female", "other"], default: null },
  age:        { type: Number, default: null },
  weight:     { type: Number, default: null },
  conditions: [{ type: String }],
  allergies:  [{ type: String }],

  // Saved medicines
  savedMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicine" }],
  searchHistory:  [{ query: String, searchedAt: { type: Date, default: Date.now } }],

}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;