const express = require("express");
const { auth } = require("../middleware/auth");
const { roleProfileMap } = require("../models");

const router = express.Router();

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  const user = req.user;
  const profileConfig = roleProfileMap[user.role];
  let profile = null;
  if (profileConfig) {
    profile = await profileConfig.model.findOne({ where: { userId: user.id } });
  }
  res.json({ user: user.toSafeJSON(), profile });
});

// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    // Update core user fields
    const userFields = ["name", "email", "phone"];
    const userUpdates = {};
    for (const field of userFields) {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    }
    if (Object.keys(userUpdates).length > 0) {
      await req.user.update(userUpdates);
    }

    // Update role-specific profile fields
    const profileConfig = roleProfileMap[req.user.role];
    let profile = null;
    if (profileConfig && req.body.profile) {
      profile = await profileConfig.model.findOne({ where: { userId: req.user.id } });
      if (profile) {
        await profile.update(req.body.profile);
      }
    }

    res.json({ user: req.user.toSafeJSON(), profile });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ error: "Update failed" });
  }
});

// PUT /api/user/password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password are required" });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await req.user.update({ password: newPassword });
    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ error: "Password update failed" });
  }
});

module.exports = router;
