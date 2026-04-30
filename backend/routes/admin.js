const express = require("express");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Task = require("../models/Task");
const Complaint = require("../models/Complaint");
const auth = require("../middleware/auth");
const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
  next();
};

// Get all users
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update user role/skills
router.put("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete user
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: "Cannot delete yourself" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// System-wide stats
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [users, customers, leads, tasks, complaints] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      Lead.countDocuments(),
      Task.countDocuments(),
      Complaint.countDocuments(),
    ]);
    const byRole = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]);
    res.json({ users, customers, leads, tasks, complaints, byRole });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
