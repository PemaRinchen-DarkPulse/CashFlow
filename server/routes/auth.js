const express = require("express");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, cid, phone, email, password, dob, bloodType, location, role } =
      req.body;

    const existing = await User.findOne({
      where: { [Op.or]: [{ cid }, { phone }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "User with this CID or phone already exists" });
    }

    const user = await User.create({
      name,
      cid,
      phone,
      email,
      password,
      dob,
      bloodType,
      location,
      role,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
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
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: "Phone/CID and password are required" });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ phone }, { cid: phone }] },
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

module.exports = router;
