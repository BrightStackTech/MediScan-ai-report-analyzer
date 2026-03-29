const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: process.env.DEFAULT_PFP || "https://lh3.googleusercontent.com/a/ACg8ocJdkAyPJT7auFng8pks43Vce5s67Ns8yamWPZoAkV0dFNY9bPA=s360-c-no",
    },
    healthProfile: {
      dateOfBirth: {
        type: String,
        default: null,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null,
      },
      weight: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
