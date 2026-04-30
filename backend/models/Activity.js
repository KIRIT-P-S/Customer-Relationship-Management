const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // "Created customer", "Updated lead", etc.
  entity: { type: String }, // "Customer", "Lead", "Task"
  entityName: { type: String },
  color: { type: String, default: "blue" },
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
