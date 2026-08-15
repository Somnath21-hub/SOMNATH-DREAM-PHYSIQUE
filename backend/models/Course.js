import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Course must be associated with an admin"],
  },
  title: {
    type: String,
    required: [true, "Please provide a course title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a course description"],
  },
  duration: {
    type: String,
    default: "6 Weeks",
  },
  intensity: {
    type: String,
    default: "Medium",
  },
  coach: {
    type: String,
    default: "Coach Marcus",
  },
  slots: {
    type: Number,
    default: 10,
  },
  price: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Course", courseSchema);
