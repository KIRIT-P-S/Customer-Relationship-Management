const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Task = require("../models/Task");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/insights", auth, async (req, res) => {
  try {
    const [customers, leads, tasks] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
    ]);
    const atRisk = customers.filter((c) => c.status === "At Risk").length;
    const inactive = customers.filter((c) => c.status === "Inactive").length;
    const churnRisk = customers.length ? Math.round(((atRisk + inactive) / customers.length) * 100) : 0;
    const statusCounts = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
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

router.post("/chat", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const [customers, leads, tasks] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
    ]);

    const prompt = `
You are an AI assistant for a CRM system. You can answer questions AND perform actions.

CRM Data:
- Customers: ${customers.length} (Active:${customers.filter(c=>c.status==="Active").length}, AtRisk:${customers.filter(c=>c.status==="At Risk").length}, Inactive:${customers.filter(c=>c.status==="Inactive").length})
- Leads: ${leads.length} (New:${leads.filter(l=>l.status==="New").length}, Qualified:${leads.filter(l=>l.status==="Qualified").length}, Lost:${leads.filter(l=>l.status==="Lost").length})
- Tasks: ${tasks.length} (Pending:${tasks.filter(t=>t.status==="Pending").length}, InProgress:${tasks.filter(t=>t.status==="In Progress").length}, Done:${tasks.filter(t=>t.status==="Done").length})

Customer names: ${customers.map(c=>c.name).join(", ") || "none"}
Lead names: ${leads.map(l=>l.name).join(", ") || "none"}
Task titles: ${tasks.map(t=>t.title).join(", ") || "none"}

If the user wants to CREATE/ADD/UPDATE/DELETE something, respond with a JSON action block like:
{"action":"create_task","data":{"title":"...","description":"...","status":"Pending","dueDate":"YYYY-MM-DD"}}
{"action":"create_customer","data":{"name":"...","email":"...","phone":"...","company":"...","status":"Active"}}
{"action":"create_lead","data":{"name":"...","email":"...","phone":"...","source":"Manual","status":"New"}}
{"action":"update_task","data":{"title":"existing task title","status":"Done"}}
{"action":"none","reply":"your normal text reply"}

Always respond with valid JSON only. No markdown. No explanation outside JSON.
User message: "${message}"`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim().replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { action: "none", reply: raw }; }

    // Execute the action
    if (parsed.action === "create_task") {
      const task = await Task.create({ ...parsed.data, user: req.user._id });
      return res.json({ reply: `✅ Task "${task.title}" created successfully!`, action: "create_task", result: task });
    }
    if (parsed.action === "create_customer") {
      const customer = await Customer.create({ ...parsed.data, user: req.user._id });
      return res.json({ reply: `✅ Customer "${customer.name}" added successfully!`, action: "create_customer", result: customer });
    }
    if (parsed.action === "create_lead") {
      const lead = await Lead.create({ ...parsed.data, user: req.user._id });
      return res.json({ reply: `✅ Lead "${lead.name}" added successfully!`, action: "create_lead", result: lead });
    }
    if (parsed.action === "update_task") {
      const task = await Task.findOneAndUpdate(
        { user: req.user._id, title: new RegExp(parsed.data.title, "i") },
        { status: parsed.data.status },
        { new: true }
      );
      return res.json({ reply: task ? `✅ Task "${task.title}" updated to ${task.status}!` : "❌ Task not found.", action: "update_task" });
    }

    res.json({ reply: parsed.reply || raw, action: "none" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
