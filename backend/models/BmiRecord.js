import mongoose from "mongoose";

const bmiRecordSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "BMI record must be associated with an admin"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Please provide user's name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide user's email"],
    trim: true,
  },
  height: {
    type: Number,
    required: [true, "Please provide height in cm"],
  },
  weight: {
    type: Number,
    required: [true, "Please provide weight in kg"],
  },
  gender: {
    type: String,
    required: [true, "Please provide gender"],
  },
  bmi: {
    type: Number,
    required: [true, "Please provide BMI value"],
  },
  result: {
    type: String,
    required: [true, "Please provide BMI category/result"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("BmiRecord", bmiRecordSchema);
