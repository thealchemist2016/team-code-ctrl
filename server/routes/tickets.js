const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');
const { adminOnly } = require('../middleware');

// GET / — get tickets for current user (all if admin)
router.get('/', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    let tickets;
    if (user.role === 'admin') {
      tickets = db.getTickets();
    } else {
      tickets = db.getTicketsByUser(user._id);
    }
    res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching tickets' });
  }
});

// POST / — create a new ticket
router.post('/', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const { subject, message, category } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Subject and message are required' });
    }
    const ticket = db.saveTicket({
      userId: user._id,
      username: user.username,
      subject,
      message,
      category: category || 'general',
      status: 'open',
      replies: [],
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error creating ticket' });
  }
});

// POST /:id/reply — reply to a ticket (admin only)
router.post('/:id/reply', withAuth, adminOnly, function(req, res) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const user = db.findUserByUsername(req.username);
    const reply = {
      message,
      username: user.username,
      createdAt: new Date().toISOString()
    };
    const ticket = db.addTicketReply(req.params.id, reply);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error replying to ticket' });
  }
});

module.exports = router;
