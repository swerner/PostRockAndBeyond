var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Dj = mongoose.model("Dj");
var Artist = mongoose.model("Artist");
var Track = mongoose.model("Track");

var Play = new Schema({
  timestamp: Number,
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0},
  listeners: {type: Number, default: 0},
  dj: {type: Schema.ObjectId, ref: 'Dj'},
  artist: {type: Schema.ObjectId, ref: 'Artist'},
  track: {type: Schema.ObjectId, ref: 'Track'}
});

Play.methods.findLatestPlays = function(cb){
  return this.find().sort({"timestamp":-1}).limit(10).toArray(cb);
};

exports.Play = Play;
