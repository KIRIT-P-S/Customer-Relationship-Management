const express = require("express");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { search, status } = req.query;
  let filter = { user: req.user._id };
  if (status) filter.status = status;
  if (search) filter.$or = [
    { title: new RegExp(search, "i") },
    { description: new RegExp(search, "i") },
  ];
  const tasks = await Task.find(filter).sort("-createdAt");
  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Created task", entity: "Task", entityName: task.title, color: "yellow" });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    await Activity.create({ user: req.user._id, action: `Task marked ${task.status}`, entity: "Task", entityName: task.title, color: "blue" });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Deleted task", entity: "Task", entityName: task?.title, color: "red" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
