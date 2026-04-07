const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" },
  dueDate: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
