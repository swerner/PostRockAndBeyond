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

bot.on('update_votes', function(data){
  votelog = data.room.metadata;
  bot.roomInfo(function(data){
    trackProvider.findByStarttime(data.room.metadata.current_song.starttime, function(error, results){
        results[0].upvotes = votelog.upvotes
        results[0].downvotes = votelog.downvotes
        trackProvider.update(results[0]);
    });
   });
});

bot.on('speak', function(data){
  text = data.text;
  user = data.userid;
  if(user == process.env.TTUID){
    if(text == "/upvote"){
      bot.vote('up');
    }

  }
});
