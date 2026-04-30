const express = require("express");
const Lead = require("../models/Lead");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { search, status } = req.query;
  let filter = { user: req.user._id };
  if (status) filter.status = status;
  if (search) filter.$or = [
    { name: new RegExp(search, "i") },
    { email: new RegExp(search, "i") },
    { source: new RegExp(search, "i") },
  ];
  const leads = await Lead.find(filter).sort("-createdAt");
  res.json(leads);
});

router.post("/", auth, async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Added lead", entity: "Lead", entityName: lead.name, color: "purple" });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    await Activity.create({ user: req.user._id, action: "Updated lead", entity: "Lead", entityName: lead.name, color: "blue" });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Deleted lead", entity: "Lead", entityName: lead?.name, color: "red" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
