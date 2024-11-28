import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // For email sending
import crypto from "crypto"; // For generating OTP
import jwt from "jsonwebtoken"

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // If you need cookies or other credentials
}));
app.use(express.json());
dotenv.config();

const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  mobile: Number,
  otp: String, // OTP storage
  otpExpiry: Date, // OTP expiry time
});

const userModel = mongoose.model("users", userSchema);

// Nodemailer transporter setup (email sending)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP to email
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
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// Forgot Password Route (Step 1 - OTP sending)
app.post("/forgot-password", async (req, res) => {
  const { email, mobile } = req.body;

  if (!email && !mobile) {
    return res.status(400).json({ error: "Either email or mobile must be provided." });
  }

  const user = email ? await userModel.findOne({ email }) : await userModel.findOne({ mobile });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 300000; // OTP expires in 5 minutes
  await user.save();

  // Send OTP to email
  try {
    await sendOTPEmail(user.email, otp);
    console.log(`OTP sent to ${user.email}: ${otp}`);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Failed to send OTP via email:", err);
    res.status(500).json({ error: "Failed to send OTP via email" });
  }
});

app.post('/verify-password-reset', async (req, res) => {
  console.log('Received request body:', req.body);  // Log the request body

  const { email, code, newPassword } = req.body;

  // Check for missing fields
  if (!email || !code || !newPassword) {
    console.log('Missing fields');
    return res.status(400).json({ error: 'Missing fields: email, code, or newPassword' });
  }

  try {
    // Find user by email
    const user = await userModel.findOne({ email });


    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== code || user.otpExpiration < Date.now()) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined; // Clear OTP after successful reset
    user.otpExpiration = undefined; // Clear OTP expiration
    await user.save();

    console.log('Password reset successful');
    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password' });
  }
});



// Forgot Username Route (Step 1 - OTP sending)
app.post("/forgot-username", async (req, res) => {
  const { email, mobile } = req.body;

  if (!email && !mobile) {
    return res.status(400).json({ error: "Either email or mobile must be provided." });
  }

  const user = email ? await userModel.findOne({ email }) : await userModel.findOne({ mobile });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 300000; // OTP expires in 5 minutes
  await user.save();
  
  if (email) {
    // Send OTP to email
    try {
      await sendOTPEmail(user.email, otp);
      console.log(`OTP sent to ${user.email}: ${otp}`);
      res.json({ message: "OTP sent to your email" });
    } catch (err) {
      console.error("Failed to send OTP via email:", err);
      res.status(500).json({ error: "Failed to send OTP via email" });
    }
  } else {
    // Send OTP via SMS (integrate SMS service like Twilio in production)
    console.log(`Sending OTP ${otp} to mobile: ${user.mobile}`);
    res.json({ message: "OTP sent to your mobile" });
  }
});

// Verify OTP for Forgot Username (Step 2 - Username Retrieval)
app.post("/verify-username-otp", async (req, res) => {
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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token not provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Register API
app.post('/registers/', async (req, res) => {
  try {
    const { username, password, email, mobile } = req.body;
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ username, password: hashedPassword, email, mobile });
    await newUser.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Login API
app.post("/login/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (isPasswordMatched) {
      const payload = { username: user.username };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }); // Token expires in 30 days
      res.json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET API - Read all users (for admin or testing purposes)
app.get("/getusers/", async (req, res) => {
  try {
    const userData = await userModel.find();
    res.json({ data: userData });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

