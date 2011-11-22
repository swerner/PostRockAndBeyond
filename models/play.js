var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Dj = mongoose.model("Dj");
var Artist = mongoose.model("Artist");
var Track = mongoose.model("Track");

var Play = new Schema({
  timestamp: Number,
  upvotes: Number,
  downvotes: Number,
  dj: [Dj],
  artist: [Artist],
  track: [Track]
});

exports.Play = Play;
