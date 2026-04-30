const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
