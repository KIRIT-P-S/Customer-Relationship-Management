const express = require("express");
const Reminder = require("../models/Reminder");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort("remindAt");
    res.json(reminders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Reminder.countDocuments({
      user: req.user._id,
      isRead: false,
      remindAt: { $lte: new Date() },
    });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, user: req.user._id });
    res.json(reminder);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    res.json(reminder);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
