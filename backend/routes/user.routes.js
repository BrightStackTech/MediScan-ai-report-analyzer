const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, getProfile, updateProfilePicture, updateHealthProfile, deleteAllUserData } = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile/picture", auth, upload.single("profilePicture"), updateProfilePicture);
router.put("/health-profile", auth, updateHealthProfile);
router.delete("/delete-all-data", auth, deleteAllUserData);

module.exports = router;
