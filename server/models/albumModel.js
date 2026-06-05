const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require ('./userModel');


let AlbumSchema = new Schema({
  albumName: {type: String, required: true},
  numberOfTracks: {type: Number, required: true},
  artist: {type: String, required: false},
  cover: {type: String, required: false},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  }]
});

module.exports = mongoose.model('Album', AlbumSchema);
