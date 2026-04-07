const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  source: { type: String, default: "Manual" },
  status: { type: String, enum: ["New", "Contacted", "Qualified", "Lost"], default: "New" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
