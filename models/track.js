var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Track = new Schema({
  name: String,
  album: String,
  artist: {type: Schema.ObjectId, ref:'Artist'}
});

Track.statics.find_or_create_by_name = function(name, album, artist, instance, cb){
  elem = this;
  elem.findOne({name: name, album: album, artist: artist}, function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
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
