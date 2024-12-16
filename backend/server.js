import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // Email sending
import crypto from "crypto"; // Generate OTP
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';  // Import uuidv4

dotenv.config();
const app = express();
const products = [];

app.use(cors({
  origin: ["http://localhost:3000", "https://vinaymart.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 200,
}));

// app.use(cors({
//   origin: 'http://localhost:3000',  // Allow frontend to make requests
//   credentials: true,               // Allow sending cookies (important if you're using sessions)
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
// }));
// app.options('*', cors()); // Enable preflight for all routes


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
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  secretKey: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  registrationDate: { type: Date, default: Date.now }, // Ensure registrationDate is set
  lastLoginTime: { type: Date },
});

const userModel = mongoose.model("users", userSchema);


// Product Schema
// const productSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   category: { type: String, required: true },
//   image: { type: String, required: true },  // Image URL should be required
//   rating: {
//     rate: { type: Number, required: true, min: 0, max: 5  },
//     count: { type: Number, required: true, min: 0 }
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// const productModel = mongoose.model("Product", productSchema);


const productSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/[^\s]+$/.test(v);  // Simple regex for URL validation
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  rating: {
    rate: { type: Number, required: true, min: 0, max: 5, default: 0 },
    count: { type: Number, required: true, min: 0, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
});

// Indexing category for better query performance
productSchema.index({ category: 1 });

const productModel = mongoose.model('Product', productSchema);



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
  try {
      // Check for token in the Authorization or jwt_token header
      const token = req.headers.authorization?.split(' ')[1] || req.headers.jwt_token;
      
      // If no token found, return error
      if (!token) {
          return res.status(401).json({ error: "Access Denied. No token provided." });
      }
      
      // Verify the token
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified; // Add verified user data to the request object
      next(); // Proceed to the next middleware or route handler
  } catch (err) {
      res.status(400).json({ error: "Invalid Token" });
  }
};



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
      registrationDate: new Date() // Store the current date and time
    });

    console.log('User Data Before Saving:', newUser);  // Debugging line to check the user data

    await newUser.save();
    console.log('User Registered with registrationDate:', newUser.registrationDate);  // Debugging line
    res.json({ message: `${newUserRole} registered successfully`, registrationDate: newUser.registrationDate  });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



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

    user.lastLoginTime = new Date(); // Update last login time
    await user.save();

    console.log('User logged in with lastLoginTime:', user.lastLoginTime);  // Debugging line

    const payload = {  _id: user._id, username: user.username, role: user.role };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token: jwtToken, role: user.role, lastLoginTime: user.lastLoginTime }); // Include lastLoginTime in response
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

app.get("/admin/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admins only." });
  }

  try {
    const users = await userModel.find().select('username email mobile password role registrationDate lastLoginTime');
    
    // Ensure the date is formatted properly
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      registrationDate: user.registrationDate.toLocaleString(),
      lastLoginTime: user.lastLoginTime ? user.lastLoginTime.toLocaleString() : null,
    }));

    res.json({ data: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete user or admin (admin only)
app.delete('/admin/users/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, message: 'Authorization token is missing or invalid.' });
  }

  const jwtToken = authHeader.split(' ')[1];

  try {
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden. Only admins can delete users.' });
    }

    console.log("Attempting to delete user with ID:", userId);

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid User ID:", userId);
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    // Check if the user being deleted is an admin (if deleting an admin)
    const userToDelete = await userModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (userToDelete.role === 'admin') {
      // Ensure that the logged-in admin cannot delete themselves
      if (decoded._id.toString() === userId) {
        return res.status(403).json({ success: false, message: 'Admin cannot delete themselves.' });
      }
    }

    // Delete the user
    await userModel.findByIdAndDelete(userId);

    // Return different success messages depending on user role
    if (userToDelete.role === 'admin') {
      console.log("Admin deleted successfully:", userId);
      return res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
    } else {
      console.log("User deleted successfully:", userId);
      return res.status(200).json({ success: true, message: 'User deleted successfully.' });
    }

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


// Admin Dashboard (Admin only)
app.get('/admin/dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to access this route' });
  }
  res.json({ message: 'Welcome to Admin Dashboard' });
});


// Admin: Create Product
app.post("/admin/products", verifyToken, async (req, res) => {
  console.log("Received request to create a new product");

  // Check if the user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admins only." });
  }

  try {
    // Destructure product data from the request body
    const { title, description, price, category, image, rating } = req.body;

    // Validate if required fields are provided
    if (!title || !description || !price || !category || !image || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate price and rating
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    if (isNaN(rating.rate) || rating.rate < 0 || rating.rate > 5) {
      return res.status(400).json({ error: "Rating must be between 0 and 5" });
    }

    // Validate image URL
    const isValidUrl = (str) => {
      try {
        const url = new URL(str);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;
      }
    };

    if (!isValidUrl(image)) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    // Create a new product document with a unique id
    const newProduct = new productModel({
      id: uuidv4(),  
      title,
      description,
      price,
      category,
      image,
      rating: {
        rate: parseFloat(rating.rate),
        count: parseInt(rating.count)
      },
    });

    // Save the product to the database
    await newProduct.save();

    // Respond with the success message and product data
    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/admin/products", verifyToken, async (req, res) => {
  console.log("Received request to get all products");

  // Check if the user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admins only." });
  }

  try {
    // Fetch all products from the database
    const products = await productModel.find();

    // Respond with the list of products
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Get Total Product Count (Admin only)
// app.get("/admin/product-count", verifyToken, async (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ error: "Forbidden. Admins only." });
//   }

//   try {
//     const totalProducts = await productModel.countDocuments();
//     res.json({ totalProducts });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

export default app;
