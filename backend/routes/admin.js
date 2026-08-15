import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import CoursePlan from "../models/CoursePlan.js";
import BmiRecord from "../models/BmiRecord.js";
import Enrollment from "../models/Enrollment.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

// 1. Admin Login (separate from general login)
router.post("/auth/login", async (req, res) => {
  try {
    const { email: rawEmail, password: rawPassword } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    const password = rawPassword?.trim();


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can access the admin portal.",
      });
    }

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
      message: "Admin login successful",
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

// All following routes require Auth and Admin Role
router.use(isAuthenticated, isAdmin);

// 2. Dashboard Stats
router.get("/dashboard-stats", async (req, res) => {
  try {
    const adminId = req.user._id;

    const totalUsers = await User.countDocuments({ adminId, role: "user" });
    const activeUsers = await User.countDocuments({ adminId, role: "user", isActive: true });
    const blockedUsers = await User.countDocuments({ adminId, role: "user", isActive: false });

    const totalCourses = await Course.countDocuments({ adminId });
    const activeCourses = await Course.countDocuments({ adminId, isActive: true });

    const totalBmiRecords = await BmiRecord.countDocuments({ adminId });
    const totalEnrollments = await Enrollment.countDocuments({ adminId });

    const pendingEnrollments = await Enrollment.countDocuments({ adminId, status: "pending" });
    const activeEnrollments = await Enrollment.countDocuments({ adminId, status: "active" });

    // Users added by month (last 6 months) for visualization
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userGrowth = await User.aggregate([
      { $match: { adminId, role: "user", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Map aggregates to friendly month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedGrowth = userGrowth.map(item => ({
      month: `${months[item._id.month - 1]}`,
      users: item.count
    }));

    // Membership distributions
    const membershipTypeCounts = await User.aggregate([
      { $match: { adminId, role: "user" } },
      { $group: { _id: "$membershipType", count: { $sum: 1 } } }
    ]);

    const formattedMembership = membershipTypeCounts.map(item => ({
      name: item._id ? item._id.toUpperCase() : "NONE/BASIC",
      value: item.count
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalCourses,
        activeCourses,
        totalBmiRecords,
        totalEnrollments,
        pendingEnrollments,
        activeEnrollments
      },
      userGrowth: formattedGrowth.length > 0 ? formattedGrowth : [{ month: "Current", users: totalUsers }],
      membershipDistribution: formattedMembership.length > 0 ? formattedMembership : [{ name: "basic", value: 1 }]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 3. User Management
// Get & search users
router.get("/users", async (req, res) => {
  try {
    const { search } = req.query;
    const adminId = req.user._id;
    let query = { adminId, role: "user" };

    if (search) {
      query = {
        $and: [
          { adminId, role: "user" },
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        ]
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 });

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

// Create manual user (client)
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, phone, address, membershipType } = req.body;
    const adminId = req.user._id;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in name, email and password",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "A user with this email address already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      membershipType: membershipType || "basic",
      role: "user",
      adminId,
    });

    res.status(201).json({
      success: true,
      message: "Client registered successfully under your admin account",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Toggle block/unblock status
router.put("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = req.user._id;

    const user = await User.findOne({ _id: id, adminId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "unblocked" : "blocked"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const user = await User.findOne({ _id: id, adminId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    await User.findByIdAndDelete(id);

    // Clean up related enrollments and BMI records belonging to this admin
    await Enrollment.deleteMany({ userId: id, adminId });
    await BmiRecord.deleteMany({ userId: id, adminId });

    res.status(200).json({
      success: true,
      message: "User and related workspace data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 4. Course Management
// Get all courses
router.get("/courses", async (req, res) => {
  try {
    const adminId = req.user._id;
    const courses = await Course.find({ adminId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add course
router.post("/courses", async (req, res) => {
  try {
    const { title, description, duration, intensity, coach, slots, price } = req.body;
    const adminId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const course = await Course.create({
      adminId,
      title,
      description,
      duration,
      intensity,
      coach,
      slots,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Edit course
router.put("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, intensity, coach, slots, price } = req.body;
    const adminId = req.user._id;

    const course = await Course.findOneAndUpdate(
      { _id: id, adminId },
      { title, description, duration, intensity, coach, slots, price },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Toggle activate/deactivate course
router.put("/courses/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = req.user._id;

    const course = await Course.findOneAndUpdate(
      { _id: id, adminId },
      { isActive },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: `Course ${isActive ? "activated" : "deactivated"} successfully`,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete course
router.delete("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const course = await Course.findOne({ _id: id, adminId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unauthorized",
      });
    }

    await Course.findByIdAndDelete(id);
    // Clean up related enrollments belonging to this admin workspace
    await Enrollment.deleteMany({ courseId: id, adminId });

    res.status(200).json({
      success: true,
      message: "Course and related enrollments deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 5. Course Plans Management
// Get all course plans
router.get("/course-plans", async (req, res) => {
  try {
    const adminId = req.user._id;
    const plans = await CoursePlan.find({ adminId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add course plan
router.post("/course-plans", async (req, res) => {
  try {
    const { name, displayName, price, duration, features } = req.body;
    const adminId = req.user._id;

    if (!name || !displayName || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, displayName, price, duration)",
      });
    }

    const plan = await CoursePlan.create({
      adminId,
      name,
      displayName,
      price,
      duration,
      features,
    });

    res.status(201).json({
      success: true,
      message: "Course plan created successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Edit course plan
router.put("/course-plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, price, duration, features } = req.body;
    const adminId = req.user._id;

    const plan = await CoursePlan.findOneAndUpdate(
      { _id: id, adminId },
      { displayName, price, duration, features },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Course plan not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course plan updated successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Toggle activate/deactivate plan
router.put("/course-plans/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = req.user._id;

    const plan = await CoursePlan.findOneAndUpdate(
      { _id: id, adminId },
      { isActive },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Course plan not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: `Course plan ${isActive ? "activated" : "deactivated"} successfully`,
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete course plan
router.delete("/course-plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const plan = await CoursePlan.findOneAndDelete({ _id: id, adminId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Course plan not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 6. BMI Records Management
// Get and search BMI records
router.get("/bmi-records", async (req, res) => {
  try {
    const { search } = req.query;
    const adminId = req.user._id;
    let query = { adminId };

    if (search) {
      query = {
        $and: [
          { adminId },
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { result: { $regex: search, $options: "i" } },
            ],
          }
        ]
      };
    }

    const records = await BmiRecord.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create BMI Record
router.post("/bmi-records", async (req, res) => {
  try {
    const { name, email, height, weight, gender, bmi, result } = req.body;
    const adminId = req.user._id;

    if (!name || !email || !height || !weight || !gender || !bmi || !result) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details",
      });
    }

    const record = await BmiRecord.create({
      adminId,
      name,
      email,
      height,
      weight,
      gender,
      bmi,
      result,
    });

    res.status(201).json({
      success: true,
      message: "BMI record created successfully",
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete BMI Record
router.delete("/bmi-records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const record = await BmiRecord.findOneAndDelete({ _id: id, adminId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BMI record not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "BMI record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 7. Course Enrollments Management
// Get and search enrollments
router.get("/enrollments", async (req, res) => {
  try {
    const { search } = req.query;
    const adminId = req.user._id;

    let enrollments = await Enrollment.find({ adminId })
      .populate("userId", "name email phone")
      .populate("courseId", "title coach duration price")
      .sort({ enrollmentDate: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      enrollments = enrollments.filter(e => {
        const userName = e.userId?.name?.toLowerCase() || "";
        const userEmail = e.userId?.email?.toLowerCase() || "";
        const courseTitle = e.courseId?.title?.toLowerCase() || "";
        const status = e.status?.toLowerCase() || "";
        return userName.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               courseTitle.includes(searchLower) ||
               status.includes(searchLower);
      });
    }

    res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Manually Enroll User in a Course
router.post("/enrollments", async (req, res) => {
  try {
    const { userId, courseId, status } = req.body;
    const adminId = req.user._id;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Course ID are required",
      });
    }

    // Verify user and course exist and belong to this admin
    const user = await User.findOne({ _id: userId, adminId });
    const course = await Course.findOne({ _id: courseId, adminId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or unauthorized" });
    }
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
    }

    // Verify if already enrolled in the same course under this admin
    const existingEnrollment = await Enrollment.findOne({ userId, courseId, adminId });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "User is already enrolled in this course",
      });
    }

    const enrollment = await Enrollment.create({
      adminId,
      userId,
      courseId,
      status: status || "active",
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate("userId", "name email phone")
      .populate("courseId", "title coach duration price");

    res.status(201).json({
      success: true,
      message: "User enrolled successfully",
      enrollment: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update enrollment status
router.put("/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user._id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: id, adminId },
      { status },
      { new: true }
    ).populate("userId", "name email phone")
     .populate("courseId", "title coach duration price");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment status updated successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel/Delete Enrollment
router.delete("/enrollments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const enrollment = await Enrollment.findOneAndDelete({ _id: id, adminId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment cancelled and deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 8. Admin Profile Management
// Update profile/password
router.put("/profile", async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;
    const adminId = req.user._id;

    const user = await User.findById(adminId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) user.password = password; // mongoose schema hooks will auto-hash this pre-save!

    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipType: user.membershipType,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
