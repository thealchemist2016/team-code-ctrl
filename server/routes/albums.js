const express = require('express');
const router = express.Router();
const Album = require('../models/albumModel');

router.post('/add', function(req, res, next) {
  let album = new Album({
    albumName: req.body.albumName,
    numberOfTracks: req.body.numberOfTracks,
    artist: req.body.artist,
    cover: req.body.cover,
    user: req.body.user
  });

  album.save(function(err, savedAlbum) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error saving album' });
    }
    req.session.lastAlbumId = savedAlbum._id;
    res.status(200).json({ message: 'Album created successfully', id: savedAlbum._id });
  });
});

router.get('/', function(req, res, next) {
  Album.find({})
    .populate('user', 'username -_id')
    .populate('tracks')
    .exec(function(err, albums) {
      if (err) {
        return next(err);
      }
      res.json(albums);
    });
});

module.exports = router;

