import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email: rawEmail, password: rawPassword, phone, address, role } = req.body;

    if (!name || !rawEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Password)",
      });
    }

    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Find default admin
    const defaultAdmin = await User.findOne({ email: "admin@gym.com" });
    const defaultAdminId = defaultAdmin ? defaultAdmin._id : null;

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      phone: phone ? phone.trim() : "",
      address: address ? address.trim() : "",
      role: role === "admin" ? "admin" : "user",
      adminId: role === "admin" ? null : defaultAdminId,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email: rawEmail, password: rawPassword } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    const password = rawPassword?.trim();


    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get current user
router.get("/me", isAuthenticated, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Update profile
router.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all users (Admin only)
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update user membership (Admin only)
router.put("/users/:id/membership", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { membershipType, membershipEndDate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { membershipType, membershipEndDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Membership updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
