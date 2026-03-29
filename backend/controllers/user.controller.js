const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const Report = require("../models/report.model");
const { sendVerificationEmail } = require("../utils/sendEmail");
const { uploadToCloudinary } = require("../config/cloudinary");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/users/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      phone,
      password,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Verify user email
// @route   GET /api/users/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
};

// @desc    Login user
// @route   POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      healthProfile: user.healthProfile,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile/picture
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload to Cloudinary from buffer
    const cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder: "mediscan/profiles",
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: cloudResult.secure_url },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update PFP error:", error);
    res.status(500).json({ message: "Server error updating profile picture" });
  }
};

// @desc    Update health profile
// @route   PUT /api/users/health-profile
const updateHealthProfile = async (req, res) => {
  try {
    const { dateOfBirth, gender, weight, height } = req.body;

    if (!dateOfBirth || !gender || !weight || !height) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        healthProfile: {
          dateOfBirth,
          gender,
          weight: parseFloat(weight),
          height: parseFloat(height),
        },
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update health profile error:", error);
    res.status(500).json({ message: "Server error updating health profile" });
  }
};

// @desc    Delete all user data
// @route   DELETE /api/users/delete-all-data
const deleteAllUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data before deletion
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all reports for this user
    await Report.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      message: "All user data has been deleted successfully",
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        reportsDeleted: true,
      },
    });
  } catch (error) {
    console.error("Delete user data error:", error);
    res.status(500).json({ message: "Server error deleting user data" });
  }
};

module.exports = { register, login, verifyEmail, getProfile, updateProfilePicture, updateHealthProfile, deleteAllUserData };
