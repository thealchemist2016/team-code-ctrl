const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');
const upload = require('../uploadConfig');

router.post('/add', withAuth, upload.single('audioFile'), function(req, res, next) {
  try {
    const albumId = req.body.albumId || req.body.album;

    if (!albumId) {
      return res.status(400).json({ message: 'No album found to attach track to.' });
    }

    const userObj = db.findUserByUsername(req.username);
    const userId = userObj ? userObj._id : 'Guest';

    const track = db.saveTrack(req.body.title, albumId, userId);

    // If an audio file was uploaded, update the track with the audioUrl
    if (req.file) {
      const data = require('fs').readFileSync(require('path').join(__dirname, '..', 'db.json'), 'utf8');
      const dbData = JSON.parse(data);
      const trackObj = dbData.tracks.find(t => t._id === track._id);
      if (trackObj) {
        trackObj.audioUrl = req.file.filename;
        require('fs').writeFileSync(require('path').join(__dirname, '..', 'db.json'), JSON.stringify(dbData, null, 2));
      }
    }

    res.status(200).json({ message: 'Track added successfully', track });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving track' });
  }
});

module.exports = router;

