import express from "express";
import Contact from "../models/Contact.js";
import WorkoutSession from "../models/WorkoutSession.js";
import User from "../models/User.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// Initialize Razorpay client conditionally
let razorpayInstance = null;
const initRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId === "YOUR_RAZORPAY_KEY_ID" || keyId.includes("DUMMY") || keyId.includes("MOCK")) {
    console.log("Razorpay keys are not configured or set to dummy/mock values. Using MOCK mode for checkout.");
    return null;
  }
  
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return razorpayInstance;
  } catch (error) {
    console.error("Failed to initialize Razorpay SDK:", error.message);
    return null;
  }
};

// Contact routes
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      message,
    });

    // Send email notification to admin
    try {
      await sendEmail({
        email: "sk4001677@gmail.com",
        subject: "GYM WEBSITE CONTACT",
        message: `New message from ${name}:\n\n${message}`,
        userEmail: email,
      });
    } catch (mailError) {
      console.warn("Mail notification could not be sent:", mailError.message);
      // Don't fail the route if mail fails, since the message is successfully stored in the database.
    }

    res.status(201).json({
      success: true,
      message: "Message sent and stored successfully!",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all contacts (Admin only)
router.get("/contacts", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update contact status (Admin only)
router.put("/contacts/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Workout session routes
router.post("/workout-sessions", isAuthenticated, async (req, res) => {
  try {
    const { sessionType, duration, caloriesBurned, notes, trainer } = req.body;

    const session = await WorkoutSession.create({
      userId: req.user._id,
      sessionType,
      duration,
      caloriesBurned,
      notes,
      trainer,
    });

    res.status(201).json({
      success: true,
      message: "Workout session logged successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user's workout sessions
router.get("/workout-sessions", isAuthenticated, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all workout sessions (Admin only)
router.get("/workout-sessions/all", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const sessions = await WorkoutSession.find()
      .populate("userId", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create a payment order (Razorpay)
router.post("/payment/checkout", isAuthenticated, async (req, res) => {
  try {
    const { amount, planName } = req.body;
    if (!amount || !planName) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount and plan name",
      });
    }

    const rzp = initRazorpay();
    
    if (!rzp) {
      // Mock payment mode
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
      return res.status(200).json({
        success: true,
        isMock: true,
        orderId: mockOrderId,
        amount: amount * 100,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_MOCK_KEY_ID",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);
    
    res.status(200).json({
      success: true,
      isMock: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
});

// Verify payment and update membership
router.post("/payment/verify", isAuthenticated, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, duration } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !planName || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all payment verification details",
      });
    }

    // Verify signature
    let signatureVerified = false;
    if (razorpay_order_id.startsWith("order_mock_")) {
      signatureVerified = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({
          success: false,
          message: "Razorpay secret key is not configured.",
        });
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        signatureVerified = true;
      }
    }

    if (!signatureVerified) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Update user membership
    const durationMonths = parseInt(duration, 10) || 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        membershipType: planName,
        membershipStartDate: new Date(),
        membershipEndDate: endDate,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Membership upgraded to ${planName} successfully!`,
      user,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
});

// Dashboard stats (Admin only)
router.get("/dashboard/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: "new" });
    const totalSessions = await WorkoutSession.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email membershipType createdAt");

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email message status createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalContacts,
        newContacts,
        totalSessions,
      },
      recentUsers,
      recentContacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
