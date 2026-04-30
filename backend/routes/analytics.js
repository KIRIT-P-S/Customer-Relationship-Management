const express = require("express");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Task = require("../models/Task");
const Complaint = require("../models/Complaint");
const Activity = require("../models/Activity");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const [customers, leads, tasks, complaints] = await Promise.all([
      Customer.find({ user: req.user._id }),
      Lead.find({ user: req.user._id }),
      Task.find({ user: req.user._id }),
      Complaint.find({ $or: [{ customer: req.user._id }, { assignedTo: req.user._id }] }),
    ]);

    // Monthly customer growth (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", { month: "short" });
      const count = customers.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, customers: count });
    }

    // Lead conversion rate
    const qualified = leads.filter(l => l.status === "Qualified").length;
    const conversionRate = leads.length ? Math.round((qualified / leads.length) * 100) : 0;

    // Task completion rate
    const done = tasks.filter(t => t.status === "Done").length;
    const taskCompletion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    // Lead sources
    const sources = leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {});

    // Complaint resolution rate
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const resolutionRate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;

    res.json({
      monthlyGrowth: months,
      conversionRate,
      taskCompletion,
      leadSources: Object.entries(sources).map(([name, value]) => ({ name, value })),
      resolutionRate,
      totalRevenue: customers.filter(c => c.status === "Active").length * 1200, // mock
      avgDealSize: 1200,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/activity", auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort("-createdAt").limit(20);
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
