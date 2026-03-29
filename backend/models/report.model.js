const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      default: null,
    },
    reportDate: {
      type: String,
      default: null,
    },
    biomarkers: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
