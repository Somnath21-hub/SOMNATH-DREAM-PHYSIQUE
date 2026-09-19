import express from "express";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { sendEmail } from "./utils/sendEmail.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import adminRoutes from "./routes/admin.js";
import { seedDatabase } from "./utils/seedData.js";

const app = express();
const router = express.Router();

// Load environment variables
config({ path: "./config.env" });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("App will continue running without database connection");
    console.log("To fix: Install MongoDB locally or update MONGODB_URI in config.env");
  });

// Use CORS properly
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev mode to prevent auth blocking
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MERN Gym Website API is running!",
    endpoints: {
      auth: "/api/auth",
      api: "/api",
      contact: "/send/mail"
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api", authRoutes); // also matches /api/register, /api/login, /api/me
app.use("/api", apiRoutes);
app.use("/api/admin", adminRoutes);


// Legacy contact route for backward compatibility
router.post("/send/mail", async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return next(
      res.status(400).json({
        success: false,
        message: "Please provide all details",
      })
    );
  }
  try {
    await sendEmail({
      email: "sk4001677@gmail.com",
      subject: "GYM WEBSITE CONTACT",
      message,
      userEmail: email,
    });
    res.status(200).json({
      success: true,
      message: "Message Sent Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.use(router);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
