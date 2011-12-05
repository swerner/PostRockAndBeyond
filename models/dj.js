var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Dj = new Schema({
  name: String,
  userid: {type: String, index: true},
  admin: {type:Boolean, default: false},
  banned: {type:Boolean, default: false},
  plays: {type:Number, default: 0},
  upvotes: {type: Number, default: 0},
  downvotes: {type: Number, default: 0}
});

Dj.statics.find_or_create_by_userid = function(dj,name,instance, cb){
  elem = this;
  elem.findOne({userid: dj}, function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
      instance.userid = dj;
      instance.name = name
      instance.plays= 0;
      instance.upvotes= 0;
      instance.downvotes= 0;
      instance.save(function(err){
        elem.findOne({userid: dj},function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};

Dj.statics.isAdmin = function(userid, cb){
  this.findOne({userid: userid}, function(err, docs){
    cb(err, docs);
  });
};

exports.Dj = Dj;
