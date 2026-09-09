const express = require('express');
const Account = require('../models/Account');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/** GET /api/accounts - fetch user's accounts from MongoDB */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json({ accounts: accounts.map((acc) => acc.toPublic()) });
  })
);

/** POST /api/accounts - save a new account to MongoDB */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, balance, color, icon, last4 } = req.body || {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'bad_request', message: 'Account name is required' });
    }

    const id = `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const account = await Account.create({
      userId: req.user._id,
      id,
      name: name.trim(),
      balance: Math.round((Number(balance) || 0) * 100) / 100,
      color: color || '#4DA3FF',
      icon: icon || 'wallet',
      last4: last4 || String(Math.floor(1000 + Math.random() * 9000)),
    });

    res.status(201).json({ account: account.toPublic() });
  })
);

module.exports = router;

