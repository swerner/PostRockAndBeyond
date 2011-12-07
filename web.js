var express = require('express');
var mongoose = require('mongoose');
var settings = require('./site_config');
var Bot = require('ttapi');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var app = express.createServer(express.logger());

var bot = require('./bot').bot;

mongoose.connect(settings.site.dburl);


var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);


var airbrake;
if(settings.airbrake && settings.airbrake.apikey){
  airbrake = require('airbrake').createClient(settings.airbrake.apikey);
}
process.addListener('uncaughtException', function(err, stack){
  console.log("Caught Exception: "+err+"\n"+err.stack);
  if(airbrake){airbrake.notify(err);}
});

app.configure(function(){
  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    siteTitle:settings.site.title,
    siteLink:settings.site.room_link
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname +'/public'));
});
app.get('/', function(request, response){
      Play.find().sort('timestamp', -1).populate('dj').populate('artist').populate('track').limit(10).run(function(error, songs){
        log_error(error, response);
        Artist.find().sort('plays', -1).limit(10).run(function(error, topArtists){
          log_error(error, response);
          Artist.find().sort('upvotes', -1).limit(10).run(function(error, upvotedArtists){
            log_error(error, response);
            Track.find().sort('plays', -1).limit(10).run(function(error, topSongs){
              log_error(error, response);
              Track.find().sort('upvotes', -1).limit(10).run(function(error, upvotedSongs){
                log_error(error, response);
                Dj.find().sort('plays', -1).limit(10).run(function(error, topDjs){
                  log_error(error, response);
                  Dj.find().sort('upvotes', -1).limit(10).run(function(error, upvotedDjs){
                    log_error(error, response);
                    response.render('index.jade', {
                      locals: {
                        title: "Home",
                        currentTrack: songs[0],
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


app.get('/artists/:name', function(request, response){
  Artist.find({name: request.params.name}).run(function(error, artist){
    log_error(error, response);
    if(artist.length == 0){notFound(request.params.name, response);return;}
    Play.find({artist: artist[0]._id}).sort('timestamp', -1).populate('dj').populate('track').limit(20).run(function(error, plays){
      log_error(error, response);
      Track.find({artist: artist[0]._id}).limit(10).sort('plays', -1).run(function(error, played){
        log_error(error, response);
        Track.find({artist: artist[0]._id}).limit(10).sort('upvotes', -1).run(function(error, tracks){
          response.render("artists/show.jade", { locals: {
            title: artist[0].name,
            artist: artist[0],
            artistName: artist[0].name,
            plays: plays,
            topPlayed: played,
            topTracks: tracks
          }});
        });
      });
    });
  });
});

app.get('/djs/:name', function(request, response){
  Dj.find({name: request.params.name}, function(error, dj){
    log_error(error, response)
    Play.find({dj: dj[0]._id}).sort('timestamp', -1).populate('track').limit(20).run(function(error, plays){
      log_error(error, response);
      response.render("djs/show.jade", { locals: {
        title: dj[0].name,
        dj: dj[0],
        plays: plays,
      }
      });
    });
  });
});
app.get('/artists', function(request, response){
  Artist.find().sort('name', 1).run(function(error, artists){
    log_error(error, response);
    response.render('artists/index.jade', { locals: {
      title: "Artists",
      artists: artists
    }
    });
  });

});
app.get('/djs', function(request, response){
  Dj.find().sort('name', 1).run(function(error, djs){
    log_error(error, response);
    response.render('djs/index.jade',{ locals: {
      title: "Djs",
      djs: djs
    }
    });
  });
});

app.get('/about', function(request, response){
  response.render('about.jade', {locals: {title: "About"}});
});
app.get('/contact', function(request, response){
  response.render('contact.jade', {locals: {title: "Contact"}});
});
notFound = function(item, response){
  response.render("error.jade", {locals: {title: "Not Found", item: item}});
}
var port = settings.port || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});

log_error = function(err, resp){
  if(err){
    console.log(err);
    resp.render("error.jade");
  }
};

