const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  category: { type: String, default: "general" }, // billing, technical, sales, etc.
  sentiment: { type: String, default: "neutral" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  aiSummary: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
