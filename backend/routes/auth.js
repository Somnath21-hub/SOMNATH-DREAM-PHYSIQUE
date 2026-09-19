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

    const email = String(rawEmail).trim().toLowerCase();
    const password = String(rawPassword).trim();
    const trimmedName = String(name).trim();

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
        message: "An account with this email already exists. Please login instead.",
      });
    }

    // Find default admin if regular user
    let defaultAdminId = null;
    if (role !== "admin") {
      const defaultAdmin = await User.findOne({ email: "admin@gym.com" });
      if (defaultAdmin) {
        defaultAdminId = defaultAdmin._id;
      }
    }

    // Create user
    const user = await User.create({
      name: trimmedName,
      email,
      password,
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
      role: role === "admin" ? "admin" : "user",
      adminId: role === "admin" ? null : defaultAdminId,
      membershipType: "basic",
      isActive: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
        phone: user.phone || "",
        address: user.address || "",
        isActive: user.isActive,
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
      message: error.message || "Registration failed. Please try again.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email: rawEmail, password: rawPassword } = req.body;

    if (!rawEmail || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const email = String(rawEmail).trim().toLowerCase();
    const password = String(rawPassword).trim();

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
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
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
        phone: user.phone || "",
        address: user.address || "",
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
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
