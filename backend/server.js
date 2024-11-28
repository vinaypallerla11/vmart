import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // Email sending
import crypto from "crypto"; // Generate OTP
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());  // for parsing application/json

// Environment Variables
const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL;

// Database Connection
mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  mobile: Number,
  otp: String,
  otpExpiry: Date,
});
const userModel = mongoose.model("users", userSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP for password reset/username retrieval is: ${otp}`,
  };
  await transporter.sendMail(mailOptions);
};

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token not provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Routes

// Register User
app.post("/registers/", async (req, res) => {
  const { username, password, email, mobile } = req.body;
  try {
    const existingUser = await userModel.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ username, password: hashedPassword, email, mobile });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Login User
app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userModel.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) return res.status(401).json({ error: "Invalid password" });

    const payload = { username: user.username };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token: jwtToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Forgot Password - Send OTP
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000; // 5 minutes expiry
    await user.save();
    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/verify-password-reset", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate OTP and reset password logic
    const user = await userModel.findOne({ email });
    if (!user || user.otp !== code || Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Forgot Username - Send OTP
app.post("/forgot-username", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000; // 5 minutes expiry
    await user.save();
    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Verify Username
// Verify OTP for Forgot Username (Step 2 - Username Retrieval)
app.post("/verify-username", async (req, res) => {
  const { email, mobile, otp, newUsername } = req.body;
  const user = email ? await userModel.findOne({ email }) : await userModel.findOne({ mobile });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if OTP is valid and not expired
  if (user.otp !== otp || Date.now() > user.otpExpiry) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // Clear OTP after successful verification
  user.otp = null;
  user.otpExpiry = null;
  user.username = newUsername;
  await user.save();

  // Return the username after OTP verification
  res.json({ username: user.username });
});

// Get All Users (Admin/Testing)
app.get("/getusers/", async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
