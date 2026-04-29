const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const { BHU } = require("../models");

const router = express.Router();

const statuses = ["Active", "Inactive"];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// GET /api/bhus
router.get("/", auth, authorize("super_admin", "hospital_admin"), async (_req, res) => {
  try {
    const bhus = await BHU.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({ bhus });
  } catch (error) {
    console.error("Fetch BHUs error:", error);
    res.status(500).json({ error: "Failed to fetch BHUs" });
  }
});

// POST /api/bhus
router.post("/", auth, authorize("super_admin"), async (req, res) => {
  try {
    const bhuData = {
      name: clean(req.body.name),
      addressLine: clean(req.body.addressLine),
      dzongkhag: clean(req.body.dzongkhag),
      gewog: clean(req.body.gewog),
      telephone: clean(req.body.telephone),
      email: clean(req.body.email).toLowerCase(),
      status: clean(req.body.status) || "Active",
    };

    const { name, addressLine, dzongkhag, gewog, telephone, email, status } = bhuData;

    if (!name || !addressLine || !dzongkhag || !gewog || !telephone || !email) {
      return res.status(400).json({ error: "All BHU fields are required" });
    }

    if (!statuses.includes(status)) {
      return res.status(400).json({ error: "Invalid BHU status" });
    }

    const bhu = await BHU.create(bhuData);

    res.status(201).json({ bhu });
  } catch (error) {
    console.error("Create BHU error:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors.map((item) => item.message).join(", ") });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A BHU with this email already exists" });
    }

    res.status(500).json({ error: "Failed to create BHU" });
  }
});

module.exports = router;
