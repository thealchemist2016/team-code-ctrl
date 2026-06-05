const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');
const { adminOnly } = require('../middleware');
const upload = require('../uploadConfig');

// POST /add — create album with optional coverArt upload
router.post('/add', withAuth, upload.single('coverArt'), function(req, res, next) {
  try {
    const userObj = db.findUserByUsername(req.username);
    const userId = userObj ? userObj._id : 'Guest';
    const album = db.saveAlbum({
      albumName: req.body.albumName,
      numberOfTracks: parseInt(req.body.numberOfTracks),
      artist: req.body.artist,
      cover: req.file ? req.file.filename : (req.body.cover || ''),
      user: userId,
      status: 'pending'
    });
    req.session.lastAlbumId = album._id;
    res.status(200).json({ message: 'Album created successfully', id: album._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving album' });
  }
});

// GET /stats — return counts by status (must be before /:id routes)
router.get('/stats', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const albums = db.getAlbumsByUser(user._id);
    const stats = {
      total: albums.length,
      pending: albums.filter(a => a.status === 'pending').length,
      approved: albums.filter(a => a.status === 'approved').length,
      rejected: albums.filter(a => a.status === 'rejected').length,
      incomplete: albums.filter(a => a.status === 'incomplete').length
    };
    res.json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching stats' });
  }
});

// GET /user — return current user's albums
router.get('/user', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const albums = db.getAlbumsByUser(user._id);
    res.json({ success: true, albums });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching albums' });
  }
});

// GET /user/:status — return current user's albums filtered by status
router.get('/user/:status', withAuth, function(req, res) {
  try {
    const user = db.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    const validStatuses = ['pending', 'approved', 'rejected', 'incomplete'];
    if (!validStatuses.includes(req.params.status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be: ' + validStatuses.join(', ') });
    }
    const albums = db.getAlbumsByUserAndStatus(user._id, req.params.status);
    res.json({ success: true, albums });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching albums' });
  }
});

// GET / — list all albums
router.get('/', function(req, res, next) {
  try {
    const albumsList = db.getAlbums();
    res.json(albumsList);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/status — change album status (admin only)
router.put('/:id/status', withAuth, adminOnly, function(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'incomplete'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be: ' + validStatuses.join(', ') });
    }
    const album = db.updateAlbumStatus(req.params.id, status);
    if (!album) {
      return res.status(404).json({ success: false, error: 'Album not found' });
    }
    res.json({ success: true, album });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error updating album status' });
  }
});

module.exports = router;
