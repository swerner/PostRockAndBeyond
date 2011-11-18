var Bot = require('ttapi');
var TrackProvider = require('./trackprovider-mongodb').TrackProvider;
var trackProvider = new TrackProvider('localhost', 27017);
var AUTH = process.env.PRABBAUTH;
var USERID= process.env.PRABBUSERID;
var ROOM= process.env.PRABBROOM;
var bot = new Bot(AUTH, USERID, ROOM);

bot.on('newsong', function(data){
  song = data.room.metadata.current_song
  dj = data.room.metadata.current_dj
  var djname = "";
  bot.getProfile(dj, function(data){
    trackProvider.save({
      title: song.metadata.song,
      artist: song.metadata.artist,
      timestamp: song.starttime,
      coverart: song.metadata.coverart,
      dj: data.name
    });
  });
});
