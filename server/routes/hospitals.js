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

const statuses = ["Active", "Inactive"];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

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
    const hospitalData = {
      name: clean(req.body.name),
      type: clean(req.body.type),
      addressLine: clean(req.body.addressLine),
      dzongkhag: clean(req.body.dzongkhag),
      gewog: clean(req.body.gewog),
      telephone: clean(req.body.telephone),
      email: clean(req.body.email).toLowerCase(),
      status: clean(req.body.status) || "Active",
    };

    const { name, type, addressLine, dzongkhag, gewog, telephone, email, status } = hospitalData;

    if (!name || !type || !addressLine || !dzongkhag || !gewog || !telephone || !email) {
      return res.status(400).json({ error: "All hospital fields are required" });
    }

    if (!hospitalTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid hospital type" });
    }

    if (!statuses.includes(status)) {
      return res.status(400).json({ error: "Invalid hospital status" });
    }

    const hospital = await Hospital.create(hospitalData);

    res.status(201).json({ hospital });
  } catch (error) {
    console.error("Create hospital error:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors.map((item) => item.message).join(", ") });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A hospital with this email already exists" });
    }

    res.status(500).json({ error: "Failed to create hospital" });
  }
});

module.exports = router;
