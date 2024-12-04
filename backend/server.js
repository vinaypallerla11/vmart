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
  origin: ["http://localhost:3000", "https://vinaymart.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());  // for parsing application/json

// Environment Variables
const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_vinay';

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
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },  // Ensure 'role' is in the schema
  secretKey: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date }
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

// Verify Token (Middleware for authentication)
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt_token;
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Routes

app.post("/registers/", async (req, res) => {
  const { username, password, email, mobile, role, secretKey } = req.body;

  try {
    // Admin Key Validation: Allow only admins to select the 'admin' role
    if (role === "admin" && (!secretKey || secretKey !== SECRET_KEY)) {
      return res.status(403).json({ error: "Invalid admin secret key" });
    }

    console.log("Received Role:", role); // Debugging line
    console.log("Received Secret Key:", secretKey); // Debugging line

    const existingUser = await userModel.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default to 'user' if no role is provided
    const newUserRole = role === "admin" ? "admin" : "user"; 
    const newUser = new userModel({ 
      username, 
      password: hashedPassword, 
      email, 
      mobile, 
      role: newUserRole, 
      secretKey // Ensure secretKey is passed here if provided
    });

    console.log('User Data Before Saving:', newUser);  // Debugging line to check the user data

    await newUser.save();
    res.json({ message: `${newUserRole} registered successfully` });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Login User (or Admin)
app.post("/login/", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await userModel.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Admin login check
    if (role === "admin" && role !== user.role) {
      return res.status(403).json({ error: "Invalid role for admin login" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) return res.status(401).json({ error: "Invalid password" });

    const payload = { username: user.username, role: user.role };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token: jwtToken, role: user.role }); // Send role in the response
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

// Verify Password Reset
app.post("/verify-password-reset", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
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
app.post("/verify-username", async (req, res) => {
  const { email, otp, newUsername } = req.body;
  const user = await userModel.findOne({ email });
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

// Get All Users (Admin only)
app.get("/getusers/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admins only." });
  }

  try {
    const users = await userModel.find();
    res.json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Admin Dashboard (Admin only)
app.get('/admin-dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to access this route' });
  }
  res.json({ message: 'Welcome to Admin Dashboard' });
});

export default app;
