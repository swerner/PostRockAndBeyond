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
  dj: {type: Schema.ObjectId, ref: 'Dj', index: true},
  artist: {type: Schema.ObjectId, ref: 'Artist', index: true},
  track: {type: Schema.ObjectId, ref: 'Track'}
});

Play.statics.find_or_create_by_timestamp = function(timestamp, dj, artist, track, instance, cb){
  elem = this;
  elem.findOne({timestamp:timestamp}).populate('dj').populate('artist').populate('track').run(function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
      instance.timestamp = timestamp;
      instance.dj = dj;
      instance.artist = artist;
      instance.track = track;
      instance.save(function(err){
        elem.findOne({timestamp:timestamp}).populate('dj').populate('artist').populate('track').run(function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};
Play.methods.findLatestPlays = function(cb){
  return this.find().sort({"timestamp":-1}).limit(10).toArray(cb);
};

exports.Play = Play;
