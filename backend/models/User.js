const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ["Admin", "Agent", "Customer"], default: "Customer" },
  skills: [{ type: String }], // e.g. ["billing", "technical", "sales"]
  expertise: { type: String, default: "" },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model("User", userSchema);
