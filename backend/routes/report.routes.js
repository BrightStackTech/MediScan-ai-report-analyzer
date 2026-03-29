const express = require("express");
const router = express.Router();
const { analyzeReport, getReportHistory, deleteReport, deleteAllReports } = require("../controllers/report.controller");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// Protected routes
router.post("/analyze", auth, upload.array("reportImage"), analyzeReport);
router.get("/history", auth, getReportHistory);
// Delete all must come BEFORE delete by ID to avoid route conflicts
router.delete("/all", auth, deleteAllReports);
router.delete("/:id", auth, deleteReport);

module.exports = router;
