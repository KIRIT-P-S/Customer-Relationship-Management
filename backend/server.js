require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/leads", require("./routes/leads"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/deals", require("./routes/deals"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/email", require("./routes/email"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
