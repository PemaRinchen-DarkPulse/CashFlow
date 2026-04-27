const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, roleProfileMap } = require("../models");
const { auth } = require("../middleware/auth");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, role, profile } = req.body;

    const validRoles = [
      "patient", "doctor", "receptionist", "hospital_admin",
      "super_admin", "pharmacist", "lab_technician", "nurse",
    ];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    if (!phone && !email) {
      return res.status(400).json({ error: "Phone or email is required" });
    }

    const existCond = [];
    if (phone) existCond.push({ phone });
    if (email) existCond.push({ email });

    const existing = await User.findOne({ where: { [Op.or]: existCond } });
    if (existing) {
      return res.status(409).json({ error: "User with this phone/email already exists" });
    }

    const user = await User.create({ name, phone, email, password, role });

    // Create the role-specific profile
    const userRole = role || "patient";
    const profileConfig = roleProfileMap[userRole];
    if (profileConfig) {
      await profileConfig.model.create({
        userId: user.id,
        ...(profile || {}),
      });
    }

    const token = generateToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    if ((!phone && !email) || !password) {
      return res
        .status(400)
        .json({ error: "Phone/Email and password are required" });
    }

    const whereClause = [];
    if (phone) whereClause.push({ phone });
    if (email) whereClause.push({ email });

    const user = await User.findOne({ 
      where: { [Op.or]: whereClause } 
    });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me – verify token & return current user
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;
