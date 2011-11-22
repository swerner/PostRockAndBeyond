var express = require('express');
var Bot = require('ttapi');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var app = express.createServer(express.logger());
var AUTH = process.env.PRABBAUTH;
var USERID= process.env.PRABBUSERID;
var ROOM= process.env.PRABBROOM;

var bot = new Bot(AUTH, USERID, ROOM);

mongoose.connect("mongodb://localhost/postrock");


var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);

bot.on('newsong', function(data){
  song = data.room.metadata.current_song;
  dj = data.room.metadata.current_dj;

  bot.getProfile(dj, function(data){
    Dj.find_or_create_by_userid(dj,data.name,new Dj(), function(err, docs){
      var dj = docs;
      Artist.find_or_create_by_name(song.metadata.artist, song, new Artist(), function(err, docs){
        var artist = docs;
        Track.find_or_create_by_name(song.metadata.song, song, new Track(), function(err, docs){
          var track = docs;
          instance = new Play();
          instance.timestamp = song.starttime;
          instance.dj.push(dj);
          instance.artist.push(artist);
          instance.save(function(err){console.log(err);});
        });
      });
    });
  });
});

app.configure(function(){
  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname +'/public'));
});

app.get('/', function(request, response){
  setCurrentSong();
  trackProvider.findAll(function(error, tracks){
    console.log("CURRENT");
    console.log(currentSong);
    response.render('index.jade', { locals: {
      title: "Post Rock And Beyond",
      tracks:tracks.reverse(),
      current: currentSong
    }
  });
  });
});

app.get('/artists/:name', function(request, response){
  setCurrentSong();
  trackProvider.findByArtist(request.params.name, function(error, tracks){
    response.render("artist_show.jade", { locals: {
      title: "Post Rock And Beyond",
      artists: tracks
    }
    });
  });
});
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});

function setCurrentSong(){
  trackProvider.findCurrentSong(function(error, results){
    currentSong = results[0];
  });
}
