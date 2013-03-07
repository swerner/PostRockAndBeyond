var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Track = new Schema({
  name: String,
  album: String,
  plays: {type:Number, default: 0},
  upvotes: {type:Number, default: 0},
  downvotes: {type:Number, default: 0},
  artist: {type: Schema.ObjectId, ref:'Artist', index: true},
  turntable_id: String
});

Track.statics.find_or_create_by_name = function(name, album, artist, turntable_id, instance, cb){
  elem = this;
  elem.findOne({name: name, album: album, artist: artist}, function(err, docs){
    if(docs){
      instance.turntable_id = turntable_id
      cb(err, docs);
    }else{
      instance.turntable_id = turntable_id
      instance.name = name;
      instance.album = album;
      instance.artist = artist;
      instance.save(function(err){
        elem.findOne({name:name, artist: artist, album:album}, function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};

exports.Track = Track;
