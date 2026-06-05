const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');

router.post('/add', withAuth, function(req, res, next) {
  try {
    const userObj = db.findUserByUsername(req.username);
    const userId = userObj ? userObj._id : 'Guest';
    const album = db.saveAlbum({
      albumName: req.body.albumName,
      numberOfTracks: parseInt(req.body.numberOfTracks),
      artist: req.body.artist,
      cover: req.body.cover,
      user: userId
    });
    req.session.lastAlbumId = album._id;
    res.status(200).json({ message: 'Album created successfully', id: album._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving album' });
  }
});

router.get('/', function(req, res, next) {
  try {
    const albumsList = db.getAlbums();
    res.json(albumsList);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

