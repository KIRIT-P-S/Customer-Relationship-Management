const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, skills, expertise } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
    const user = await User.create({ name, email, password, role: role || "Customer", skills: skills || [], expertise: expertise || "" });
    res.json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });
    res.json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, (req, res) => res.json(req.user));

router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, skills, expertise } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, skills, expertise }, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all agents (for admin)
router.get("/agents", auth, async (req, res) => {
  try {
    const agents = await User.find({ role: "Agent" }).select("-password");
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
