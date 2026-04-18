const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "dob",
      "bloodType",
      "location",
      "avatar",
      "allergies",
      "emergencyContactName",
      "emergencyContactRelation",
      "emergencyContactPhone",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await req.user.update(updates);
    res.json({ user: req.user.toSafeJSON() });
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
