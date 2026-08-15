import mongoose from "mongoose";

const coursePlanSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Course plan must be associated with an admin"],
  },
  name: {
    type: String,
    required: [true, "Please provide a plan name"],
    unique: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: [true, "Please provide a plan display name"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide a plan price"],
  },
  duration: {
    type: Number,
    required: [true, "Please provide a plan duration in months"],
  },
  features: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CoursePlan", coursePlanSchema);
