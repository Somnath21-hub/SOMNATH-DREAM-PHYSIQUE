import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import CoursePlan from "../models/CoursePlan.js";
import BmiRecord from "../models/BmiRecord.js";
import Enrollment from "../models/Enrollment.js";

export const seedDatabase = async () => {
  try {
    console.log("Checking database seed status...");

    // 1. Ensure admin user exists
    const adminExists = await User.findOne({ email: "admin@gym.com" });
    let adminId;
    if (!adminExists) {
      const admin = await User.create({
        name: "Admin User",
        email: "admin@gym.com",
        password: "admin123",
        role: "admin",
        membershipType: "vip",
        phone: "123-456-7890",
        address: "Dream Physique Headquarters",
      });
      adminId = admin._id;
      console.log("Admin seeded: admin@gym.com / admin123");
    } else {
      adminId = adminExists._id;
    }

    // Auto-migrate any existing records that do not have adminId
    await User.updateMany({ role: "user", adminId: { $exists: false } }, { adminId });
    await Course.updateMany({ adminId: { $exists: false } }, { adminId });
    await CoursePlan.updateMany({ adminId: { $exists: false } }, { adminId });
    await BmiRecord.updateMany({ adminId: { $exists: false } }, { adminId });
    await Enrollment.updateMany({ adminId: { $exists: false } }, { adminId });

    // 2. Ensure some mock users exist
    const usersCount = await User.countDocuments();
    let sampleUserId;
    if (usersCount <= 1) {
      // only admin is present
      const user1 = await User.create({
        name: "Somnath Chatterjee",
        email: "somnath@example.com",
        password: "user123",
        role: "user",
        membershipType: "YEARLY",
        phone: "987-654-3210",
        address: "Kolkata, India",
        adminId: adminId, // Associated with seeded admin
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      });
      const user2 = await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "user123",
        role: "user",
        membershipType: "QUARTERLY",
        phone: "555-019-2834",
        address: "New York, USA",
        adminId: adminId,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      });
      const user3 = await User.create({
        name: "John Smith",
        email: "john@example.com",
        password: "user123",
        role: "user",
        membershipType: "basic",
        phone: "555-987-6543",
        address: "London, UK",
        isActive: false, // Seed one blocked user for testing!
        adminId: adminId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      });
      sampleUserId = user1._id;
      console.log("Sample users seeded successfully");
    } else {
      const firstUser = await User.findOne({ role: "user" });
      if (firstUser) sampleUserId = firstUser._id;
    }

    // 3. Ensure mock courses exist
    const coursesCount = await Course.countDocuments();
    let courseIds = [];
    if (coursesCount === 0) {
      const courses = await Course.create([
        {
          adminId: adminId,
          title: "HIIT Blast",
          description: "High-intensity interval training designed to maximize calorie burn and supercharge endurance in short, explosive burst circuits.",
          duration: "6 Weeks",
          intensity: "Extreme",
          coach: "Coach Marcus",
          slots: 10,
          price: 5000,
        },
        {
          adminId: adminId,
          title: "Iron Strength",
          description: "Build raw power and structural lean muscle using barbell metrics, compound lifts, and targeted progressive overload.",
          duration: "8 Weeks",
          intensity: "High",
          coach: "Coach Sarah",
          slots: 12,
          price: 6000,
        },
        {
          adminId: adminId,
          title: "Cardio Endurance",
          description: "Aerobic and anaerobic conditioning paths designed to improve recovery, lung capacity, and overall stamina levels.",
          duration: "6 Weeks",
          intensity: "Medium-High",
          coach: "Coach David",
          slots: 15,
          price: 4500,
        },
        {
          adminId: adminId,
          title: "Yoga & Mobility",
          description: "Low-impact dynamic flows, deep alignment holding, and restorative breathing patterns for mental clarity and recovery.",
          duration: "4 Weeks",
          intensity: "Low-Medium",
          coach: "Coach Elena",
          slots: 8,
          price: 4000,
        },
      ]);
      courseIds = courses.map(c => c._id);
      console.log("Mock courses seeded successfully");
    } else {
      const existingCourses = await Course.find();
      courseIds = existingCourses.map(c => c._id);
    }

    // 4. Ensure mock course plans exist
    const plansCount = await CoursePlan.countDocuments();
    if (plansCount === 0) {
      await CoursePlan.create([
        {
          adminId: adminId,
          name: "QUARTERLY",
          displayName: "Quarterly Pack",
          price: 18000,
          duration: 3,
          features: [
            "Full gym floor & standard equipment access",
            "Standard locker room & shower facilities",
            "1 Free consultation with a certified coach",
            "Access to online workout planner builder",
          ],
        },
        {
          adminId: adminId,
          name: "HALF_YEARLY",
          displayName: "Half-Yearly Pack",
          price: 34000,
          duration: 6,
          features: [
            "Full gym floor & premium equipment access",
            "3 Free consultations with a certified coach",
            "Customized workout builder & basic diet plan",
            "Access to recovery steam room & sauna",
            "2 Complimentary guest passes per month",
          ],
        },
        {
          adminId: adminId,
          name: "YEARLY",
          displayName: "Yearly VIP Pass",
          price: 67000,
          duration: 12,
          features: [
            "24/7 Gym access & VIP keycard privileges",
            "Dedicated personal trainer (2 sessions/mo)",
            "Weekly custom diet & biomarker tracking",
            "Unlimited freezing option (up to 30 days)",
            "VIP locker, steam room & spa amenities",
            "Free entry to all Bootcamps & guest passes",
          ],
        },
      ]);
      console.log("Mock course plans seeded successfully");
    }

    // 5. Ensure mock BMI records exist
    const bmiCount = await BmiRecord.countDocuments();
    if (bmiCount === 0 && sampleUserId) {
      await BmiRecord.create([
        {
          adminId: adminId,
          userId: sampleUserId,
          name: "Somnath Chatterjee",
          email: "somnath@example.com",
          height: 175,
          weight: 72,
          gender: "Male",
          bmi: 23.51,
          result: "Normal",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: adminId,
          name: "Anonymous Guest",
          email: "guest@example.com",
          height: 160,
          weight: 70,
          gender: "Female",
          bmi: 27.34,
          result: "Overweight",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log("Mock BMI records seeded successfully");
    }

    // 6. Ensure mock Enrollments exist
    const enrollmentsCount = await Enrollment.countDocuments();
    if (enrollmentsCount === 0 && sampleUserId && courseIds.length > 0) {
      await Enrollment.create([
        {
          adminId: adminId,
          userId: sampleUserId,
          courseId: courseIds[0], // HIIT Blast
          status: "active",
          enrollmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          adminId: adminId,
          userId: sampleUserId,
          courseId: courseIds[1], // Iron Strength
          status: "pending",
          enrollmentDate: new Date(),
        },
      ]);
      console.log("Mock enrollments seeded successfully");
    }

    console.log("Database seed check complete!");
  } catch (error) {
    console.error("Failed to seed database:", error.message);
  }
};
