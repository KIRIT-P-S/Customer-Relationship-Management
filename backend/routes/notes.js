const express = require("express");
const Note = require("../models/Note");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { customer, lead } = req.query;
  const filter = customer ? { customer } : lead ? { lead } : {};
  const notes = await Note.find(filter).populate("createdBy", "name").sort("-createdAt");
  res.json(notes);
});

router.post("/", auth, async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({ user: req.user._id, action: "Added a note", entity: "Note", entityName: req.body.content.slice(0, 40), color: "gray" });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
