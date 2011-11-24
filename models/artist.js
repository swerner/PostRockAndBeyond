var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Track = mongoose.model("Track");

var Artist = new Schema({
  name: String,
  plays: Number,
  upvotes: Number,
  downvotes: Number,
  tracks: [{type: Schema.ObjectId, ref :'Track'}]
});

Artist.statics.find_or_create_by_name = function(name, song, instance, cb){
  elem = this;
  elem.findOne({name: name}, function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
      instance.name = name;
      instance.plays = 0;
      instance.upvotes= 0;
      instance.downvotes= 0;
      instance.save(function(err){
        elem.findOne({name: name}, function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};

exports.Artist = Artist;
