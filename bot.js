var settings = require('./site_config.js');
var Bot = require('ttapi');
var AUTH= settings.bot.auth;
var USERID= settings.bot.userid;
var ROOM= settings.bot.room;

var bot = new Bot(AUTH, USERID, ROOM);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dj = mongoose.model("Dj", require("./models/dj").Dj);
var Track = mongoose.model("Track", require("./models/track").Track);
var Artist = mongoose.model("Artist", require("./models/artist").Artist);
var Play = mongoose.model("Play", require("./models/play").Play);

var twitter = require('./tweets').twitter;

var currentSong;

var airbrake;

if(settings.airbrake && settings.airbrake.apikey){
  airbrake = require('airbrake').createClient(settings.airbrake.apikey);
}
process.addListener('uncaughtException', function(err, stack){
  console.log("Caught Exception: "+err+"\n"+err.stack);
  if(airbrake){airbrake.notify(err);}
});

bot.on('newsong', function(data){
  setCurrentSong(data);
  show_link(data.room.metadata.current_song.metadata.artist);
  tweet_song(data.room.metadata.current_song.metadata.artist);
});
show_link = function(artist){
    var response = artist + ' Info: ';
    response+="http://www.postrockandbeyond.com/artists/";
    response+=escape(artist);
    bot.speak(response);
};
bot.on('ready', function(data){
  bot.roomInfo(function(data){
    setCurrentSong(data);
  });
});

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

bot.on('speak', function(data){
  Dj.isAdmin(data.userid, function(err, res){
    log_error(err);
    if(res){
      var result = data.text.match(/^\/(.*?)( .*)?$/);
      if(result){
        var command = result[1].trim().toLowerCase();
        var param = '';
        if (result.length == 3 && result[2]){
          param = result[2].trim().toLowerCase();
        }

        switch(command){
          case 'sa':
          case 'setadmin':
            setAdmin(param);
            break;
          case 'da':
          case 'deladmin':
            deleteAdmin(param);
            break;

          case 'sb':
          case 'setbandcamp':
            setLink('bandcamp', param);
            break;
          case 'db':
          case 'delbandcamp':
            deleteLink('bandcamp');
            break;
          case 'sf':
          case 'setfacebook':
            setLink('facebook', param);
            break;
          case 'df':
          case 'delfacebook':
            deleteLink('facebook');
            break;
          case 'sw':
          case 'setwebsite':
            setLink('website', param);
            break;
          case 'dw':
          case 'delwebsite':
            deleteLink('website');
            break;
          case 'sfm':
          case 'setlast':
            setLink('lastfm', param);
            break;
          case 'dfm':
          case 'dellast':
            deleteLink('lastfm');
            break;
          case 'sl':
            show_link(currentSong.artist.name);
            break;
          case 'tweet':
            tweet_song(currentSong.artist.name);
            break;
        }
      }
    }
  });
});

tweet_song = function(artist){
  var status = "Now playing #"+artist.toLowerCase().replace(/\ /gi,"")+" in http://turntable.fm/postrock_beyond"
  twitter.verifyCredentials(function(){}).updateStatus(status, function(){});
};

deleteAdmin = function(name){
  bot.getProfile(name, function(data){
    Dj.update({userid: data.userid},{admin: false},function(err, docs){
      log_error();
      bot.speak(name + ' is no longer an admin.');
    });
  });
};

setAdmin = function(name){
  bot.getProfile(name, function(data){
    Dj.update({userid: data.userid},{admin: true},function(err, docs){
      bot.speak(name + ' added as an admin.');
    });
  });
};

deleteLink = function(key){
  if(key && currentSong){
    currentSong.artist.links[key] = '';
    artist = currentSong.artist;
    artist.save(function(err){log_error();});
    bot.speak("Removed "+key+" link");
  }else{console.log(key,currentSong);}
};

setLink = function(key, value){
  if(key && value && currentSong){
    currentSong.artist.links[key] = value;
    artist = currentSong.artist;
    artist.save(function(err){log_error();});
    bot.speak("Added "+key+" link: "+value);
  }else{console.log(key, value, currentSong);}
};

setCurrentSong = function(data){
  if(data.room.metadata.current_song){
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
  }
};

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
exports.currentSong = currentSong;
