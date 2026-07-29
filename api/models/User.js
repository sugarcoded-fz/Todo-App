import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  // EMAIL VERIFICATION
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,

  // PASSWORD RESET
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshToken: String
});

export default mongoose.model("User", userSchema);