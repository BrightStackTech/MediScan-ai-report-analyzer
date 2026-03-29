const { GoogleGenerativeAI } = require("@google/generative-ai");
const Report = require("../models/report.model");
const { uploadToCloudinary } = require("../config/cloudinary");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Analyze a medical report image
// @route   POST /api/reports/analyze
const analyzeReport = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    // Upload all files to Cloudinary and prepare data
    const imageUrls = [];
    let summary = "";

    // Process first file for analysis (analyze the primary report)
    const firstFile = req.files[0];
    const cloudResult = await uploadToCloudinary(firstFile.buffer, {
      folder: "mediscan/reports",
    });
    imageUrls.push(cloudResult.secure_url);

    // Upload remaining files
    for (let i = 1; i < req.files.length; i++) {
      const cloudResult = await uploadToCloudinary(req.files[i].buffer, {
        folder: "mediscan/reports",
      });
      imageUrls.push(cloudResult.secure_url);
    }

    // Use first file buffer for Gemini analysis
    const base64Image = firstFile.buffer.toString("base64");
    const mimeType = firstFile.mimetype || "image/jpeg";

    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Please analyze this medical report and provide a comprehensive yet easy-to-understand summary. Follow these guidelines:

1. Start with the most important findings or diagnoses
2. Break down medical terminology into simple language
3. Organize information into clear sections: Diagnosis, Key Findings, and Recommendations
4. Highlight any critical values or concerns that require immediate attention
5. Include any recommended follow-up actions or lifestyle changes
6. Use bullet points for better readability when appropriate
7. Do not use any asterisks or * symbols in the response

DO NOT USE ANY SYMBOL IN RESPONSE NEVER USE ANY * IN RESPONSE ONLY GIVE TEXT IN RESPONSE
Please ensure the summary is clear, concise, and actionable for someone without medical background.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    summary = result.response.text();

    // Save report to database with all image URLs
    const report = await Report.create({
      user: req.user._id,
      imageUrl: imageUrls[0],
      imageUrls: imageUrls,
      summary,
    });

    res.status(201).json({
      _id: report._id,
      reportId: report._id.toString(),
      imageUrl: report.imageUrl,
      imageUrls: report.imageUrls,
      summary: report.summary,
      createdAt: report.createdAt,
    });
  } catch (error) {
    console.error("Analyze report error:", error.message);
    res.status(500).json({ message: "Failed to analyze the report", error: error.message });
  }
};

// @desc    Get report history for logged-in user
// @route   GET /api/reports/history
const getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Format response to include both imageUrl and imageUrls
    const formattedReports = reports.map((report) => ({
      _id: report._id,
      user: report.user,
      imageUrl: report.imageUrl,
      imageUrls: report.imageUrls && report.imageUrls.length > 0 ? report.imageUrls : [report.imageUrl],
      summary: report.summary,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error("Get report history error:", error);
    res.status(500).json({ message: "Server error fetching report history" });
  }
};

// @desc    Delete a single report
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and verify ownership
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this report" });
    }

    // Delete the report
    await Report.findByIdAndDelete(id);
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({ message: "Server error deleting report" });
  }
};

// @desc    Delete all reports for logged-in user
// @route   DELETE /api/reports/all
const deleteAllReports = async (req, res) => {
  try {
    const result = await Report.deleteMany({ user: req.user._id });
    res.json({
      message: "All reports deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Delete all reports error:", error);
    res.status(500).json({ message: "Server error deleting reports" });
  }
};

module.exports = { analyzeReport, getReportHistory, deleteReport, deleteAllReports };
