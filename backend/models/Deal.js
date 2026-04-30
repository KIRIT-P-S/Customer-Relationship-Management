const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  stage: {
    type: String,
    enum: ["Prospecting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
    default: "Prospecting",
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expectedClose: { type: Date },
  probability: { type: Number, default: 20 }, // %
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Deal", dealSchema);
