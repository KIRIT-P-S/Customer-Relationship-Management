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

    // Check if Gemini API key exists
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_key_here") {
      return res.json({ 
        reply: "AI chat is not configured. Please add your GEMINI_API_KEY to environment variables.", 
        action: "none" 
      });
    }

    const [customers, leads, tasks] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
    ]);

    // Simple action detection without AI for basic commands
    const lowerMsg = message.toLowerCase();
    
    // Create task
    if (lowerMsg.includes("create task") || lowerMsg.includes("add task")) {
      const titleMatch = message.match(/task[:\s]+(.+?)(?:\s+due|\s+by|\s*$)/i);
      const title = titleMatch ? titleMatch[1].trim() : message.replace(/create task|add task/i, "").trim();
      if (title) {
        const task = await Task.create({ title, user: req.user._id });
        return res.json({ reply: `✅ Task "${task.title}" created!`, action: "create_task", result: task });
      }
    }

    // Create customer
    if (lowerMsg.includes("create customer") || lowerMsg.includes("add customer")) {
      const nameMatch = message.match(/customer[:\s]+(.+?)(?:\s+email|\s+at|\s*$)/i);
      const emailMatch = message.match(/email[:\s]+([^\s]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : "New Customer";
      const email = emailMatch ? emailMatch[1] : `${name.toLowerCase().replace(/\s+/g, "")}@example.com`;
      const customer = await Customer.create({ name, email, user: req.user._id });
      return res.json({ reply: `✅ Customer "${customer.name}" added!`, action: "create_customer", result: customer });
    }

    // Create lead
    if (lowerMsg.includes("create lead") || lowerMsg.includes("add lead")) {
      const nameMatch = message.match(/lead[:\s]+(.+?)(?:\s+email|\s+at|\s*$)/i);
      const emailMatch = message.match(/email[:\s]+([^\s]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : "New Lead";
      const email = emailMatch ? emailMatch[1] : `${name.toLowerCase().replace(/\s+/g, "")}@example.com`;
      const lead = await Lead.create({ name, email, user: req.user._id });
      return res.json({ reply: `✅ Lead "${lead.name}" added!`, action: "create_lead", result: lead });
    }

    // Try Gemini AI for complex queries
    try {
      const context = `
You are a CRM assistant. Current data:
- Customers: ${customers.length} (${customers.map(c=>c.name).join(", ") || "none"})
- Leads: ${leads.length} (${leads.map(l=>l.name).join(", ") || "none"}) 
- Tasks: ${tasks.length} (${tasks.map(t=>t.title).join(", ") || "none"})

Answer this question: ${message}`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(context);
      const reply = result.response.text();
      return res.json({ reply, action: "none" });
    } catch (aiError) {
      console.error("Gemini AI Error:", aiError.message);
      
      // Fallback response
      const stats = `You have ${customers.length} customers, ${leads.length} leads, and ${tasks.length} tasks. `;
      let fallbackReply = stats;
      
      if (lowerMsg.includes("how many") || lowerMsg.includes("count")) {
        fallbackReply += "Use commands like 'create task: follow up with John' or 'add customer: Jane Doe' to manage your CRM.";
      } else {
        fallbackReply += "I can help you create tasks, customers, and leads. Try: 'create task: call client tomorrow'";
      }
      
      return res.json({ reply: fallbackReply, action: "none" });
    }

  } catch (err) {
    console.error("Chat Error:", err.message);
    res.status(500).json({ message: "Chat service temporarily unavailable. Try simple commands like 'create task: your task name'" });
  }
});

module.exports = router;