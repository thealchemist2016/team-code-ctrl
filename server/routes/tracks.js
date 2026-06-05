const express = require('express');
const router = express.Router();
const Track = require('../models/trackModel');
const Album = require('../models/albumModel');

// Helper to save track and associate with album
const saveTrackForAlbum = (albumId, req, res) => {
  let track = new Track({
    title: req.body.title,
    album: albumId
  });

  track.save(function(err, savedTrack) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error saving track' });
    }

    // Attach track reference to the Album
    Album.findById(albumId, function(err, album) {
      if (album) {
        album.tracks.push(savedTrack._id);
        album.save(function(err) {
          if (err) {
            console.error("Error linking track to album", err);
          }
        });
      }
    });

    return res.status(200).json({ message: 'Track added successfully' });
  });
};

router.post('/add', function(req, res, next) {
  const albumId = req.session.lastAlbumId;

  if (!albumId) {
    // Fallback: find the latest created album in the DB
    Album.findOne({}, {}, { sort: { '_id' : -1 } }, function(err, latestAlbum) {
      if (err || !latestAlbum) {
        return res.status(400).json({ message: 'No album found to attach track to.' });
      }
      saveTrackForAlbum(latestAlbum._id, req, res);
    });
  } else {
    saveTrackForAlbum(albumId, req, res);
  }
});

module.exports = router;
