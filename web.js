var express = require('express');
var mongoose = require('mongoose');
var Bot = require('ttapi');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var app = express.createServer(express.logger());

var bot = require('./bot').bot;

mongoose.connect("mongodb://localhost/prab");


var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);


app.configure(function(){
  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname +'/public'));
});
app.get('/test', function(req, resp){
  djs = ['4ecc217b4fe7d03a6c000529','4e4179044fe7d02e6f040501','4e13d951a3f75114d00887eb'];
  Dj.find({userid: {$in: djs}}, function(err, djs){
    log_error(err);
    Play.find().sort('timestamp', -1).populate('dj').populate('artist').populate('track').limit(10).run(function(err, songs){
      log_error(err);
      Artist.find().sort('plays', -1).limit(10).run(function(err, topArtists){
        log_error(err);
        Artist.find().sort('upvotes', -1).limit(10).run(function(err, upvotedArtists){
          log_error(err);
          Track.find().sort('plays', -1).limit(10).run(function(err, topSongs){
            log_error(err);
            Track.find().sort('upvotes', -1).limit(10).run(function(err, upvotedSongs){
              log_error(err);
              Dj.find().sort('plays', -1).limit(10).run(function(err, topDjs){
                log_error(err);
                Dj.find().sort('upvotes', -1).limit(10).run(function(err, upvotedDjs){
                  log_error(err);
                  resp.render('index.jade', {
                    locals: {
                      title: "Home",
                      currentTrack: {artist: "Toe", album: "For Long Tomorrow", song: "Goodbye"},
                      djs: djs,
                      songs: songs,
                      topArtists: topArtists,
                      upvotedArtists: upvotedArtists,
                      topSongs: topSongs,
                      upvotedSongs: upvotedSongs,
                      topDjs: topDjs,
                      upvotedDjs: upvotedDjs
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });

});

app.get('/', function(request, response){
  bot.roomInfo(function(data){
    dj_data = data.room.metadata.djs;
    current_song = data.room.metadata.current_song;
    if(current_song){
      current_song = current_song.metadata;
    }
  Dj.find({userid: {$in: dj_data}}, function(err, djs){
    log_error(err);
    Play.find().sort('timestamp', -1).populate('dj').populate('artist').populate('track').limit(10).run(function(err, songs){
      log_error(err);
      Artist.find().sort('plays', -1).limit(10).run(function(err, topArtists){
        log_error(err);
        Artist.find().sort('upvotes', -1).limit(10).run(function(err, upvotedArtists){
          log_error(err);
          Track.find().sort('plays', -1).limit(10).run(function(err, topSongs){
            log_error(err);
            Track.find().sort('upvotes', -1).limit(10).run(function(err, upvotedSongs){
              log_error(err);
              Dj.find().sort('plays', -1).limit(10).run(function(err, topDjs){
                log_error(err);
                Dj.find().sort('upvotes', -1).limit(10).run(function(err, upvotedDjs){
                  log_error(err);
                  response.render('index.jade', {
                    locals: {
                      title: "Home",
                      currentTrack: current_song,
                      djs: djs,
                      songs: songs,
                      topArtists: topArtists,
                      upvotedArtists: upvotedArtists,
                      topSongs: topSongs,
                      upvotedSongs: upvotedSongs,
                      topDjs: topDjs,
                      upvotedDjs: upvotedDjs
                    }
                  });
                });
              });
            });
          });
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

