const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log unhandled errors instead of crashing
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

app.get("/", (req, res) => {
  res.json({ message: "AiMediCare API is running" });
});

// Routes
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Sync DB and start server
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Kill the other process or use a different port.`);
      } else {
        console.error("Server error:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err.message);
  });

module.exports = app;
