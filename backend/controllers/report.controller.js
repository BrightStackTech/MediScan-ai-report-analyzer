const { GoogleGenerativeAI } = require("@google/generative-ai");
const Report = require("../models/report.model");
const { uploadToCloudinary } = require("../config/cloudinary");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeReport = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    // Upload all files to Cloudinary and prepare data
    const imageUrls = [];
    let summary = "";
    let hospitalName = null;
    let reportDate = null;
    let biomarkers = null;

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

    // First: Extract metadata (hospital name, date, and biomarkers)
    const metadataPrompt = `Extract ALL information from this medical report image:

1. Hospital/Diagnostic Center Name - find any hospital/lab name
2. Report Date - find "Sample Received On", "Reported on", "Date of Report", return as shown
3. ALL BIOMARKERS - Extract EVERY test from ANY table:
   - Get ALL rows - do NOT omit any tests
   - Include: Test Name, Result Value, Unit, Reference Range, Method (if shown)

Return ONLY valid JSON:
{
  "hospitalName": "hospital name or null",
  "reportDate": "date or null",
  "biomarkers": [
    {
      "name": "exact test name from table",
      "value": "result value",
      "unit": "measurement unit",
      "normalRange": "reference range",
      "method": "method name or null"
    }
  ]
}

CRITICAL: Extract EVERY row from the table. Do NOT skip or filter any tests. Include duplicates if any.`;

    const metadataResult = await model.generateContent([
      metadataPrompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    try {
      const metadataText = metadataResult.response.text().trim();
      console.log("Metadata extraction response:", metadataText);

      // Remove markdown formatting if present (```json ... ```)
      const cleanedText = metadataText
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      const metadata = JSON.parse(cleanedText);
      hospitalName = metadata.hospitalName;
      reportDate = metadata.reportDate;
      biomarkers = metadata.biomarkers || null;
      console.log("Extracted metadata - Hospital:", hospitalName, "Date:", reportDate, "Biomarkers count:", biomarkers?.length || 0);
    } catch (parseError) {
      console.log("Could not parse metadata:", parseError.message);
    }

    // Second: Generate summary
    const summaryPrompt = `Please analyze this medical report. Generate a SHORT summary following THESE EXACT RULES:

1. HOSPITAL HEADER: First line with XXXX markers (e.g., XXXX Shri Ram Hospital XXXX)
2. REPORT DATE: Second line as "Report Date: DD Month YYYY"

3. TWO SECTIONS with XXXX markers:
   - XXXX Most Important Findings and Diagnoses XXXX
   - XXXX Key Findings and Recommendations XXXX

4. CRITICAL RULE - INCLUDE ALL MEDICAL NUMBERS:
   - YOU MUST include EVERY numerical value from the report in the summary
   - Format EXACTLY like: "Test Name is VALUE UNIT (normal: RANGE)"
   - Examples: "Hemoglobin is 8.5 g/dL (normal: 12.0-16.0 g/dL)", "Platelet count is 6,16,000 lakhs/cumm (normal: 1.5-4.5 lakhs/cumm)"
   - Include ALL measurements - do NOT skip any numbers
   - Write as plain sentences, not lists
   - Keep it readable

5. ONLY IF NO NUMBERS FOUND: If the report contains NO numerical data, then just write a brief text summary without numbers.

6. LENGTH: Keep to 2-3 short paragraphs maximum
7. FORMAT: NO ASTERISKS, NO MARKDOWN - plain text only

EXAMPLE OUTPUT:
XXXX Apollo Hospital XXXX
Report Date: 15 March 2024

XXXX Most Important Findings and Diagnoses XXXX
The patient shows severe anemia with Hemoglobin at 8.5 g/dL (normal: 12.0-16.0 g/dL). Red blood cell count is 3.81 millions/cumm (normal: 4.1-5.5 millions/cumm). Platelet count is elevated at 6,16,000 lakhs/cumm (normal: 1.5-4.5 lakhs/cumm).

XXXX Key Findings and Recommendations XXXX
Further evaluation is recommended...`;

    const summaryResult = await model.generateContent([
      summaryPrompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    summary = summaryResult.response.text();

    // Save report to database with all image URLs and extracted metadata
    const report = await Report.create({
      user: req.user._id,
      imageUrl: imageUrls[0],
      imageUrls: imageUrls,
      summary,
      hospitalName,
      reportDate,
      biomarkers,
    });

    res.status(201).json({
      _id: report._id,
      reportId: report._id.toString(),
      imageUrl: report.imageUrl,
      imageUrls: report.imageUrls,
      summary: report.summary,
      hospitalName: report.hospitalName,
      reportDate: report.reportDate,
      biomarkers: report.biomarkers,
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
      hospitalName: report.hospitalName,
      reportDate: report.reportDate,
      biomarkers: report.biomarkers,
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
