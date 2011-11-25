var Bot = require('ttapi');
var AUTH= process.env.PRABBAUTH;
var USERID= process.env.PRABBUSERID;
var ROOM= process.env.PRABBROOM;

var bot = new Bot(AUTH, USERID, ROOM);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);
var currentSong;

bot.on('newsong', function(data){
  setCurrentSong(data);
});
bot.on('ready', function(data){
  bot.roomInfo(function(data){
    setCurrentSong(data);
  });
});
setCurrentSong = function(data){
  song = data.room.metadata.current_song;
  dj = data.room.metadata.current_dj;
  upvotes = data.room.metadata.upvotes;
  downvotes = data.room.metadata.downvotes;
  listeners = data.room.metadata.listeners;

  bot.getProfile(dj, function(data){
    Dj.find_or_create_by_userid(dj,data.name,new Dj(), function(err, docs){
      log_error(err);
      var dj = docs;
      Artist.find_or_create_by_name(song.metadata.artist, song, new Artist(), function(err, docs){
        log_error(err);
        var artist = docs;
        Track.find_or_create_by_name(song.metadata.song, song.metadata.album, artist.id, new Track(), function(err, docs){
          log_error(err);
          var track = docs;
          artist.tracks.push(track.id);
          artist.save(function(err){log_error(err);});
          Play.find_or_create_by_timestamp(song.starttime, dj.id, artist.id, track.id, new Play(), function(err, docs){
            currentSong = docs;
            currentSong.upvotes = upvotes;
            currentSong.downvotes = downvotes;
            currentSong.listeners = listeners;
          });
        });
      });
    });
  });
};
bot.on('update_votes', function(data){
  currentSong.upvotes= data.room.metadata.upvotes;
  currentSong.downvotes= data.room.metadata.downvotes;
  currentSong.listeners= data.room.metadata.listeners;
  currentSong.save(function(err){log_error(err);});
});

bot.on('endsong', function(){
  updatePlayInfo();
});
bot.on('add_dj', function(data){
  Dj.find_or_create_by_userid(data.user[0].userid, data.user[0].name, new Dj(), function(err, docs){
        log_error(err);
  });
});
updatePlayInfo = function(){
  currentSong.dj.plays++;
  currentSong.dj.upvotes = currentSong.dj.upvotes ? currentSong.dj.upvotes+currentSong.upvotes : currentSong.upvotes;
  currentSong.dj.downvotes = currentSong.dj.downvotes ? currentSong.dj.downvotes+currentSong.downvotes : currentSong.downvotes;
  dj = currentSong.dj;
  dj.save(function(err){log_error(err);});

  currentSong.artist.plays = currentSong.artist.plays ? currentSong.artist.plays+1 : 1;
  currentSong.artist.upvotes = currentSong.artist.upvotes ? currentSong.artist.upvotes+currentSong.upvotes : currentSong.upvotes;
  currentSong.artist.downvotes = currentSong.artist.downvotes ? currentSong.artist.downvotes+currentSong.downvotes : currentSong.downvotes;
  artist = currentSong.artist;
  artist.save(function(err){log_error(err);});

  currentSong.track.plays = currentSong.track.plays ? currentSong.track.plays+1:1;
  currentSong.track.upvotes = currentSong.track.upvotes ? currentSong.track.upvotes+currentSong.upvotes : currentSong.upvotes;
  currentSong.track.downvotes = currentSong.track.downvotes ? currentSong.track.downvotes+currentSong.downvotes : currentSong.downvotes;
  track = currentSong.track;
  track.save(function(err){log_error(err);});
  currentSong.save(function(err){log_error(err);});
};
log_error = function(err){
  if(err){
    console.log(err);
  }
};
exports.bot = bot;
