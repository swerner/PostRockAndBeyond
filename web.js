var express = require('express');
var Bot = require('ttapi');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var app = express.createServer(express.logger());
var AUTH = process.env.PRABBAUTH;
var USERID= process.env.PRABBUSERID;
var ROOM= process.env.PRABBROOM;
var gacode = process.end.GACODE;

var bot = new Bot(AUTH, USERID, ROOM);

mongoose.connect("mongodb://localhost/prab");


var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);

var currentSong;

bot.on('newsong', function(data){
  song = data.room.metadata.current_song;
  dj = data.room.metadata.current_dj;

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
          instance = new Play();
          instance.timestamp = song.starttime;
          instance.dj = dj.id;
          instance.artist = artist.id;
          instance.track = track.id;
          instance.save(function(err){
            log_error(err);
              Play.find({timestamp: song.starttime}).populate('dj').populate('artist').populate('track').run(function(err, docs){
                log_error(err);
                currentSong = docs[0];
            });
          });
        });
      });
    });
  });
});

bot.on('update_votes', function(data){
  currentSong.upvotes= data.room.metadata.upvotes;
  currentSong.downvotes= data.room.metadata.downvotes;
  currentSong.listeners= data.room.metadata.listeners;
  currentSong.save(function(err){log_error(err);});
});

bot.on('end_song', function(){
  currentSong.dj.plays++;
  currentSong.dj.upvotes+=currentSong.upvotes;
  currentSong.dj.downvotes+=currentSong.downvotes;
  dj = currentSong.dj;
  dj.save(function(err){log_error(err);});

  currentSong.artist.plays++;
  currentSong.artist.upvotes+=currentSong.upvotes;
  currentSong.artist.downvotes+=currentSong.downvotes;
  artist = currentSong.artist;
  artist.save(function(err){log_error(err);});

  currentSong.track.plays++;
  currentSong.track.upvotes+=currentSong.upvotes;
  currentSong.track.downvotes+=currentSong.downvotes;
  track = currentSong.track;
  track.save(function(err){log_error(err);});
  currentSong.save(function(err){log_error(err);});
});
bot.on('add_dj', function(data){
  Dj.find_or_create_by_userid(data.user[0].userid, data.user[0].name, new Dj(), function(err, docs){
        log_error(err);
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
app.set('view options', {
  gacode: gacode
});

app.get('/', function(request, response){
  bot.roomInfo(function(data){
    dj_data = data.room.metadata.djs;
    current_song = data.room.metadata.current_song;
    if(current_song){
      current_song = current_song.metadata;
    }
    Dj.find({userid: {$in: dj_data}}, function(err, docs){
        log_error(err);
      djs= docs;
      Play.find().sort('timestamp',-1).populate('dj').populate('artist').populate('track').limit(10).run(function(err, docs){
        log_error(err);
        songs = docs;
        Artist.find().sort('plays', -1).limit(10).run(function(err, docs){
          log_error(err);
          topPlays = docs;
          Artist.find().sort('upvotes', -1).limit(10).run(function(err, docs){
            topUpvotes = docs;
            response.render("index.jade", {
              locals: {
                title: "Post Rock And Beyond",
                currentTrack: current_song,
                djs: djs,
                songs: songs,
                topPlays: topPlays,
                topUpvotes: topUpvotes
              }});
          
          });
        
        });

      });
    });
  });
});


app.get('/artists/:name', function(request, response){
  Artist.find({name: request.params.name}).populate('tracks').run(function(error, artist){
    log_error(error);
    response.render("artist_show.jade", { locals: {
      title: "Post Rock And Beyond",
      artist: artist[0],
    }
    });
  });
});

app.get('/djs/:name', function(request, response){
  Dj.find({name: request.params.name}, function(error, dj){
    log_error(error)
    response.render("dj_show.jade", { locals: {
      title: "Post Rock And Beyond",
      dj: dj[0]
    }
    })
  });
});

var port = process.env.PBPORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});

log_error = function(err){
  if(err){
    console.log(err);
  }
};
