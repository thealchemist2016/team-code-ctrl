const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');
const { adminOnly } = require('../middleware');

// GET / — get notifications for current user
router.get('/', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const notifications = db.getNotificationsByUser(user._id);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching notifications' });
  }
});

// POST / — create notification for a user (admin only)
router.post('/', withAuth, adminOnly, function(req, res) {
  try {
    const { userId, message, type } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ success: false, error: 'userId and message are required' });
    }
    const targetUser = db.findUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target user not found' });
    }
    const notification = db.saveNotification({
      userId,
      message,
      type: type || 'info',
      read: false,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error creating notification' });
  }
});

module.exports = router;
