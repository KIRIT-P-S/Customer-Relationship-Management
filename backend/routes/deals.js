const express = require("express");
const Deal = require("../models/Deal");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const deals = await Deal.find({ user: req.user._id })
      .populate("customer", "name email")
      .populate("lead", "name email")
      .populate("assignedTo", "name")
      .sort("-createdAt");
    res.json(deals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Created deal", entity: "Deal", entityName: deal.title, color: "green" });
    res.json(deal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const deal = await Deal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true })
      .populate("customer", "name email").populate("lead", "name email").populate("assignedTo", "name");
    await Activity.create({ user: req.user._id, action: `Deal moved to ${deal.stage}`, entity: "Deal", entityName: deal.title, color: "blue" });
    res.json(deal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Deleted deal", entity: "Deal", entityName: deal?.title, color: "red" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
