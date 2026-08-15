import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  membershipType: {
    type: String,
    enum: ["basic", "premium", "vip", "QUARTERLY", "HALF_YEARLY", "YEARLY"],
    default: "basic",
  },
  membershipStartDate: {
    type: Date,
    default: Date.now,
  },
  membershipEndDate: {
    type: Date,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  resetPasswordOtp: {
    type: String,
  },
  resetPasswordOtpExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
