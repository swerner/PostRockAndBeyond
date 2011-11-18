var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

TrackProvider = function(host, port){
  this.db = new Db('postrock', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

TrackProvider.prototype.getCollection= function(callback){
  this.db.collection('tracks', function(error, track_collection){
    if(error) callback(error);
    else callback(null, track_collection);
  });
};

TrackProvider.prototype.findAll = function(callback){
  this.getCollection(function(error, track_collection){
    if(error) callback(error)
      else{
        track_collection.find().toArray(function(error, results){
          if(error) callback(error)
          else callback(null, results);
        });
      }
  });
};

TrackProvider.prototype.findByArtist = function(artistName, callback){
  this.getCollection(function(error, track_collection){
    if(error) callback(error)
      else{
        track_collection.find({artist: artistName}).toArray(function(error, results){
          if(error) callback(error)
            else callback(null, results);
        });
      }
  });
};

TrackProvider.prototype.save = function(track, callback){
  this.getCollection(function(error, track_collection){
    if(error){
      callback(error);
    }else{
      console.log(track);
      console.log(track_collection);
        track_collection.insert(track, function(err, docs){
        });
      }
  });
};

exports.TrackProvider = TrackProvider;

