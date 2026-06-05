const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const withAuth = require('../middleware');
const db = require('../db');
const secret = 'gracie';

router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  const user = db.findUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  const same = db.comparePassword(password, user.password);
  if (!same) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  // Issue token
  const payload = { username };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true })
    .status(200)
    .json({ redirect: true, message: 'Logged in successfully' });
});

router.post('/register', function(req, res, next){
  const { fname, lname, email, username, password, tosAccepted } = req.body;

  if (!fname || typeof fname !== 'string' || fname.trim() === '' ||
      !lname || typeof lname !== 'string' || lname.trim() === '' ||
      !email || typeof email !== 'string' || email.trim() === '' ||
      !username || typeof username !== 'string' || username.trim() === '' ||
      !password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: "Invalid email format" });
  }

  if (!tosAccepted) {
    return res.status(400).json({ message: "Terms of Service must be accepted.", success: false });
  }
  if (db.findUserByUsername(username)) {
    return res.status(400).json({ message: "Username already exists.", success: false });
  }
  if (db.findUserByEmail(email)) {
    return res.status(400).json({ message: "Email already exists.", success: false });
  }
  try {
    db.saveUser({ fname, lname, email, username, password, tosAccepted: true });
    res.status(200).json({ message: "New user registered", success: true });
  } catch (err) {
    res.status(500).json({ message: "Error registering new user. Please try again.", success: false });
  }
});

router.get('/verify', withAuth, function(req, res, next) {
  const user = db.findUserByUsername(req.username);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid token user' });
  }
  res.status(200).json({
    success: true,
    user: {
      username: user.username,
      role: user.role,
      balance: user.balance
    }
  });
});

router.post('/logout', function(req, res, next) {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/dashboard', withAuth, function(req, res, next) {
  res.send('The dashboard');
});

// GET /profile — return full user profile (excluding password)
router.get('/profile', withAuth, function(req, res) {
  const user = db.findUserByUsername(req.username);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const { password, ...profile } = user;
  res.json({ success: true, user: profile });
});

// PUT /profile — update address and bankInfo fields only
router.put('/profile', withAuth, function(req, res) {
  const user = db.findUserByUsername(req.username);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const updates = {};
  if (req.body.address !== undefined) updates.address = req.body.address;
  if (req.body.bankInfo !== undefined) updates.bankInfo = req.body.bankInfo;
  const updated = db.updateUser(req.username, updates);
  if (!updated) {
    return res.status(500).json({ success: false, error: 'Error updating profile' });
  }
  const { password, ...profile } = updated;
  res.json({ success: true, user: profile });
});

// POST /profile/tax-doc — upload tax document
const upload = require('../uploadConfig');
router.post('/profile/tax-doc', withAuth, upload.single('taxDoc'), function(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const updated = db.updateUser(req.username, { taxDoc: req.file.filename });
  if (!updated) {
    return res.status(500).json({ success: false, error: 'Error saving tax document' });
  }
  res.json({ success: true, message: 'Tax document uploaded', filename: req.file.filename });
});

module.exports = router;
