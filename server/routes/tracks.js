const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  try {
    const albumId = req.body.albumId || req.body.album;

    if (!albumId) {
      return res.status(400).json({ message: 'No album found to attach track to.' });
    }

    const userObj = db.findUserByUsername(req.username);
    const userId = userObj ? userObj._id : 'Guest';

    db.saveTrack(req.body.title, albumId, userId);

    res.status(200).json({ message: 'Track added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving track' });
  }
});

module.exports = router;
