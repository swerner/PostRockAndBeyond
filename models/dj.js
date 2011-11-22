var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Dj = new Schema({
  name: String,
  userid: String
});

Dj.statics.find_or_create_by_userid = function(dj,name,instance, cb){
  elem = this;
  elem.findOne({userid: dj}, function(err, docs){
    if(docs){
      cb(err, docs);
    }else{
      instance.userid = dj;
      instance.name = name
      instance.save(function(err){
        elem.findOne({userid: dj},function(err, docs){
          cb(err, docs);
        });
      });
    }
  });
};


exports.Dj = Dj;
