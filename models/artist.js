var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Artist = new Schema({
  name: String,
  lowername: String,
  linkname: String,
  plays: {type:Number, default: 0},
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0},
  tracks: [{type: Schema.ObjectId, ref :'Track'}],
  links: {
    bandcamp: String,
    facebook: String,
    website: String
  }
});

Artist.statics.find_or_create_by_name = function(name, song, instance, cb){
  elem = this;
  elem.findOne({name: name}, function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
      instance.name = name;
      instance.lowername = name.toLowerCase();
      instance.linkname = name.toLowerCase().replace(/\ /gi, "-");
      instance.save(function(err){
        elem.findOne({name: name}, function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};

exports.Artist = Artist;
