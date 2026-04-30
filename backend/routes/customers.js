const express = require("express");
const Customer = require("../models/Customer");
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
    { company: new RegExp(search, "i") },
  ];
  const customers = await Customer.find(filter).sort("-createdAt");
  res.json(customers);
});

router.post("/", auth, async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Added customer", entity: "Customer", entityName: customer.name, color: "green" });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    await Activity.create({ user: req.user._id, action: "Updated customer", entity: "Customer", entityName: customer.name, color: "blue" });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    await Activity.create({ user: req.user._id, action: "Deleted customer", entity: "Customer", entityName: customer?.name, color: "red" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
