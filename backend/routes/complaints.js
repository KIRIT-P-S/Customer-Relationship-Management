const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Customer submits a complaint (text or transcribed voice)
router.post("/", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Complaint text required" });

    // Get all agents
    const agents = await User.find({ role: "Agent" });

    const agentList = agents.map(a =>
      `ID:${a._id} Name:${a.name} Skills:${a.skills.join(", ") || "general"}`
    ).join("\n");

    const prompt = `
You are a CRM complaint routing AI. Analyze this customer complaint and return a JSON object only (no markdown, no explanation):
{
  "category": "one of: billing, technical, sales, general, refund, delivery",
  "sentiment": "one of: positive, neutral, negative, urgent",
  "summary": "one sentence summary of the complaint",
  "assignedAgentId": "the ID of the best matching agent from the list below, or null if no agents"
}

Complaint: "${text}"

Available Agents:
${agentList || "No agents available"}

Match the complaint category to agent skills. Return only valid JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();

    // Strip markdown code blocks if present
    raw = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);

    const complaint = await Complaint.create({
      customer: req.user._id,
      text,
      category: parsed.category || "general",
      sentiment: parsed.sentiment || "neutral",
      aiSummary: parsed.summary || "",
      assignedTo: parsed.assignedAgentId || null,
      status: parsed.assignedAgentId ? "In Progress" : "Open",
    });

    const populated = await complaint.populate("assignedTo", "name email skills");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaints - customers see their own, agents see assigned, admins see all
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "Customer") filter = { customer: req.user._id };
    else if (req.user.role === "Agent") filter = { assignedTo: req.user._id };

    const complaints = await Complaint.find(filter)
      .populate("customer", "name email")
      .populate("assignedTo", "name email")
      .sort("-createdAt");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.put("/:id", auth, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("customer", "name email")
      .populate("assignedTo", "name email");
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
