const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Task = require("../models/Task");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stats insights (no AI needed, pure data)
router.get("/insights", auth, async (req, res) => {
  try {
    const [customers, leads, tasks] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
    ]);

    const atRisk = customers.filter((c) => c.status === "At Risk").length;
    const inactive = customers.filter((c) => c.status === "Inactive").length;
    const churnRisk = customers.length
      ? Math.round(((atRisk + inactive) / customers.length) * 100)
      : 0;

    const statusCounts = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.status === "Active").length,
      churnRisk: `${churnRisk}%`,
      atRiskCount: atRisk,
      totalLeads: leads.length,
      leadsByStatus: statusCounts,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "Pending").length,
      sentiment: { positive: 60, neutral: 20, negative: 20 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Gemini AI chat for CRM advice
router.post("/chat", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const [customers, leads, tasks] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
    ]);

    const context = `
You are an AI assistant for a CRM system. Here is the current CRM data:
- Total Customers: ${customers.length} (Active: ${customers.filter(c => c.status === "Active").length}, At Risk: ${customers.filter(c => c.status === "At Risk").length}, Inactive: ${customers.filter(c => c.status === "Inactive").length})
- Total Leads: ${leads.length} (New: ${leads.filter(l => l.status === "New").length}, Qualified: ${leads.filter(l => l.status === "Qualified").length}, Lost: ${leads.filter(l => l.status === "Lost").length})
- Total Tasks: ${tasks.length} (Pending: ${tasks.filter(t => t.status === "Pending").length}, In Progress: ${tasks.filter(t => t.status === "In Progress").length}, Done: ${tasks.filter(t => t.status === "Done").length})

Answer the user's question based on this data. Be concise and helpful.
User: ${message}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(context);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
