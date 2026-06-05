const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');

// GET / — get withdrawals for current user
router.get('/', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const withdrawals = db.getWithdrawalsByUser(user._id);
    res.json({ success: true, withdrawals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching withdrawals' });
  }
});

// POST / — request a withdrawal
router.post('/', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const { amount, method, details } = req.body;
    if (!amount || !method) {
      return res.status(400).json({ success: false, error: 'Amount and method are required' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }
    if (numAmount > user.balance) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }
    const withdrawal = db.saveWithdrawal({
      userId: user._id,
      username: user.username,
      amount: numAmount,
      method,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, withdrawal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error creating withdrawal request' });
  }
});

module.exports = router;
