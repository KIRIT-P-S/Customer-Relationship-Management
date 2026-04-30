const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  remindAt: { type: Date, required: true },
  type: { type: String, enum: ["Task", "Follow-up", "Meeting", "Call", "Other"], default: "Other" },
  isRead: { type: Boolean, default: false },
  relatedTo: { type: String, default: "" }, // customer/lead name
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);
