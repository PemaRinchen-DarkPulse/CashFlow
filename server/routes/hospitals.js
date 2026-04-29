const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const { Hospital } = require("../models");

const router = express.Router();

const hospitalTypes = [
  "National Referral Hospital",
  "Regional Referral Hospital",
  "District Hospital",
  "Traditional Medicine Hospital",
];

// GET /api/hospitals
router.get("/", auth, authorize("super_admin", "hospital_admin"), async (_req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({ hospitals });
  } catch (error) {
    console.error("Fetch hospitals error:", error);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

// POST /api/hospitals
router.post("/", auth, authorize("super_admin"), async (req, res) => {
  try {
    const { name, type, addressLine, dzongkhag, gewog, telephone, email } = req.body;

    if (!name || !type || !addressLine || !dzongkhag || !gewog || !telephone || !email) {
      return res.status(400).json({ error: "All hospital fields are required" });
    }

    if (!hospitalTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid hospital type" });
    }

    const hospital = await Hospital.create({
      name,
      type,
      addressLine,
      dzongkhag,
      gewog,
      telephone,
      email,
    });

    res.status(201).json({ hospital });
  } catch (error) {
    console.error("Create hospital error:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors.map((item) => item.message).join(", ") });
    }

    res.status(500).json({ error: "Failed to create hospital" });
  }
});

module.exports = router;
